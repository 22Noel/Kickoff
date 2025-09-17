import {
  createMatch,
  deleteMatch,
  getMatchById,
  getMatchesByUser,
  updateMatch,
  getMatches
} from "../persistence/matches_repository.js";
import { getAllUsers } from "../persistence/users_repository.js";
import {
  addPlayerToMatch,
  bulkUpdatePlayers,
  getPlaysRelation,
  getPlaysRelationsByMatchId,
} from "../persistence/plays_repository.js";
import {
  createInviteLink,
  validateInviteLink,
} from "../persistence/invite_links_repository.js";
import UnexistingUserError from "../types/UnexistingUserError.js";
import { Router } from "express"
import jwt from "jsonwebtoken";
import { matches } from "../drizzle/schema.js";
import { match } from "node:assert";

type Match = typeof matches.$inferSelect;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// JWT authentication middleware
function authenticateJWT(req: any, res: any, next: any) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ message: "Missing Authorization header" });
  }
  try {
    if (!JWT_SECRET) {
      return res.status(500).send({ message: "JWT secret is not configured" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = (decoded as any).userId;
    next();
  } catch (err) {
    return res.status(403).send({ message: "Invalid or expired token" });
  }
}

const matchRouter = Router();
matchRouter.use((req, res, next) => {
  authenticateJWT(req, res, next);
});

let FRONTEND_URL: string;
let DEBUG: boolean;

if (process.env.NODE_ENV === "development") {
  FRONTEND_URL = "http://localhost:5173";
  DEBUG = true;
} else {
  FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  DEBUG = process.env.DEBUG === "true";
}

matchRouter.get("/", async (req, res) => {
  try {
    const matches = await getMatches();
    res.send(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

matchRouter.post("/create", async (req: any, res) => {
  const { timestamp, location } = req.body;
  const userId = req.userId;
  const isPublic = req.body.isPublic || false;
  const newMatch = await createMatch(timestamp, location, userId, isPublic);
  await addPlayerToMatch(userId, newMatch.id);
  res.send(newMatch);
});

matchRouter.post("/delete", async (req, res) => {
  const { id } = req.body;
  await deleteMatch(parseInt(id));
  res.status(204).send();
});

matchRouter.post("/update", async (req, res) => {
  const { id, scoreLocal, scoreAway, timestamp, mvp } = req.body;
  const updatedMatch = await updateMatch(
    parseInt(id),
    scoreLocal,
    scoreAway,
    timestamp,
    mvp ? parseInt(mvp) : null,
  );
  res.send(updatedMatch);
});

matchRouter.get("/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const matches = await getMatchesByUser(userId);
    res.send(matches);
  } catch (error: any) {
    if (error instanceof UnexistingUserError) {
      res.status(404).send({ message: error.message });
    } else {
      res.status(500).send({ message: "Internal server error" });
    }
  }
});

// Players and plays routes
matchRouter.post("/players/add", async (req, res) => {
  try {
    const { matchId, playerId } = req.body;
    const newPlayer = await addPlayerToMatch(playerId, parseInt(matchId));
    res.send(newPlayer);
  } catch (err) {
    console.error("Error in players/add:", err);
    res.status(500).send({
      message: "Failed to add player to match",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

matchRouter.post("/players/bulk-add", async (req, res) => {
  try {
    const { matchId, players } = req.body;
    const parsedMatchId = parseInt(matchId);

    // Map players for update operation
    const mappedPlayers = players.map((
      player: { playerId: number; team?: string },
    ) => ({
      userId: player.playerId,
      team: player.team || "",
      matchId: parsedMatchId,
    }));

    if (DEBUG) {
      console.log("Updating match players:", mappedPlayers);
    }

    // Use the repository function to handle the updates within a transaction
    const updatedPlayers = await bulkUpdatePlayers(
      parsedMatchId,
      mappedPlayers,
    );
    res.send(updatedPlayers);
  } catch (err) {
    console.error("Error in bulk-add:", err);
    res.status(500).send({
      message: "Error updating match players. Changes were rolled back.",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

matchRouter.get("/stats/:userId", async (req, res) => {
  const userId: number = parseInt(req.params.userId);
  const matches: Match[] = await getMatchesByUser(userId);
  const finishedMatches = matches.filter(match => match.finished);

  const stats = {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    goalsScored: 0,
    mvps: 0,
  };
  for (const match of finishedMatches) {
    stats.totalMatches++;
    const playsRelation = await getPlaysRelation(userId, match.id);
    if (playsRelation && typeof playsRelation.goals === "number") {
      stats.goalsScored += playsRelation.goals;
    }
    if (
      match.mvp !== null &&
      match.mvp.toString() === userId.toString()
    ) {
      stats.mvps++;
    }
    if (playsRelation && playsRelation.team) {
      if (playsRelation.team === "A") {
        if (match.scoreLocal > match.scoreAway) {
          stats.wins++;
        } else if (match.scoreLocal < match.scoreAway) {
          stats.losses++;
        }
      } else if (playsRelation.team === "B") {
        if (match.scoreAway > match.scoreLocal) {
          stats.wins++;
        } else if (match.scoreAway < match.scoreLocal) {
          stats.losses++;
        }
      }
    }

  }
  res.send(stats);
});

matchRouter.get("/:matchId/players", async (req, res) => {
  const matchId = req.params.matchId;
  const match = await getMatchById(parseInt(matchId));
  if (match) {
    const playsRelations = await getPlaysRelationsByMatchId(parseInt(matchId));
    // Fetch all users for mapping userId to username
    const allUsers = await getAllUsers();
    const players = playsRelations.map((player) => {
      const user = allUsers.find((u) => u.id === player.userId);
      return {
        ...player,
        username: user ? user.username : `ID:${player.userId}`,
        goals: player.goals || 0,
      };
    });
    res.send(players);
  } else {
    res.status(404).send({ message: "Match not found" });
  }
});

matchRouter.get("/:matchId/invite", async (req, res) => {
  const matchId = req.params.matchId;
  const match = await getMatchById(parseInt(matchId));
  if (!match) {
    res.status(404).send({ message: "Match not found" });
    return;
  }

  const inviteLink = await createInviteLink(parseInt(matchId));
  if (!inviteLink) {
    res.status(500).send({ message: "Failed to create invite link" });
    return;
  }
  res.send({
    code: inviteLink.code,
    url: `${FRONTEND_URL}/matches/join/${inviteLink.code}`,
    expiresAt: inviteLink.expiresAt,
  });
});

matchRouter.post("/join/:matchId", async (req, res) => {
  const { matchId } = req.params;
  const { userId, inviteCode } = req.body;

  const match = await getMatchById(parseInt(matchId));
  let joinedMatch;
  if (match?.isPublic) {
    joinedMatch = await addPlayerToMatch(userId, match.id);
  } else {
    const invite = await validateInviteLink(inviteCode);
    if (!invite) {
      res.status(404).send({ message: "Invalid or expired invite link" });
      return;
    }
    // Add player to match with empty team
    joinedMatch = await addPlayerToMatch(userId, invite.matchId);
  }

  res.send({ matchId: joinedMatch.matchId });
});

matchRouter.get("/invite/:code", async (req, res) => {
  const { code } = req.params;
  const invite = await validateInviteLink(code);

  if (!invite) {
    res.status(404).send({ message: "Invalid or expired invite link" });
    return;
  }

  const match = await getMatchById(invite.matchId);
  if (match) {
    res.send(match);
  } else {
    res.status(404).send({ message: "Match not found" });
  }
});

matchRouter.get("/:matchId", async (req: any, res) => {
  if (!req.params.matchId || isNaN(parseInt(req.params.matchId))) {
    res.status(400).send({ message: "Invalid match ID" });
    return;
  }

  const matchId: number = parseInt(req.params.matchId);
  const userId: number = req.userId;
  const inviteCode: string | undefined = req.query.inviteCode;
  const match = await getMatchById(matchId);

  if (!match) {
    res.status(404).send({ message: "Match not found" });
    return;
  }

  // Allow access if match is public
  if (match.isPublic) {
    res.send(match);
    return;
  }

  // Allow access if invite code is valid
  if (inviteCode) {
    const invite = await validateInviteLink(inviteCode);
    if (invite && invite.matchId === matchId) {
      res.send(match);
      return;
    }
  }

  // Allow access if user is a player in the match
  const playsRelation = await getPlaysRelation(userId, matchId);
  if (playsRelation) {
    res.send(match);
    return;
  }

  res.status(403).send({
    message: "Forbidden: You are not allowed to view this match",
  });
});

export default matchRouter;
