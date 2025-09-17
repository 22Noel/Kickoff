import { plays } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import { db } from "./db.js";

type Play = typeof plays.$inferSelect;

type PlayResult = Play;

type AddPlayerToMatchResult = PlayResult;

type AddPlayersToMatchInput = { playerId: number, matchId: number, team?: string }[];

type UpdatePlayGoalsResult = PlayResult;

// Result interfaces
interface PlayData {
  userId: number;
  matchId: number;
  team: string;
  goals?: number;
}

export async function addPlayerToMatch(playerId: number, matchId: number): Promise<AddPlayerToMatchResult> {
  const result = await db.insert(plays).values({ 
    userId: playerId, 
    matchId, 
    goals: 0,
    team: '' // Empty team by default
  }).returning().execute();

  if (!result[0]) {
    throw new Error('Failed to add player to match');
  }

  return {
    userId: result[0].userId,
    matchId: result[0].matchId,
    team: result[0].team || '',
    goals: result[0].goals || 0
  };
}

export async function addPlayersToMatch(players: AddPlayersToMatchInput): Promise<PlayResult[]> {
  const result = await db.insert(plays).values(
    players.map(player => ({ 
      userId: player.playerId, 
      matchId: player.matchId,
      team: player.team || '',
      goals: 0 
    }))
  ).returning().execute();
  return result;
}

export async function updatePlayGoals(userId: number, matchId: number, goals: number): Promise<UpdatePlayGoalsResult> {
  // First check if the play exists
  const existing = await getPlaysRelation(userId, matchId);
  if (!existing) {
    throw new Error('Player not found in match');
  }

  // Ensure goals is a non-negative number
  const validGoals = Math.max(0, goals);

  const result = await db.update(plays)
    .set({ goals: validGoals })
    .where(and(eq(plays.userId, userId), eq(plays.matchId, matchId)))
    .returning()
    .execute();

  if (!result[0]) {
    throw new Error('Failed to update player goals');
  }

  return {
    userId: result[0].userId,
    matchId: result[0].matchId,
    team: result[0].team || '',
    goals: result[0].goals || 0
  };
}

export async function getPlaysRelation(userId: number, matchId: number): Promise<PlayResult | null> {
  const result = await db.select().from(plays)
    .where(and(eq(plays.userId, userId), eq(plays.matchId, matchId)))
    .execute();

  if (!result[0]) {
    return null;
  }

  return {
    userId: result[0].userId,
    matchId: result[0].matchId,
    team: result[0].team || '',
    goals: result[0].goals || 0
  };
}

export async function getPlaysRelationsByMatchId(matchId: number): Promise<PlayResult[]> {
  const result = await db.select().from(plays)
    .where(eq(plays.matchId, matchId))
    .execute();

  return result.map((p: Play) => ({
    userId: p.userId,
    matchId: p.matchId,
    team: p.team || '',
    goals: p.goals || 0
  }));
}

export async function deletePlaysByMatchId(matchId: number): Promise<void> {
  await db.delete(plays)
    .where(eq(plays.matchId, matchId))
    .execute();
}

export async function bulkUpdatePlayers(matchId: number, newPlayers: PlayData[]): Promise<PlayResult[]> {
  try {
    const result = await db.transaction(async (tx) => {
      // Get existing plays to preserve goals
      const existingPlays = await tx.select().from(plays)
        .where(eq(plays.matchId, matchId))
        .execute();
      
      // Delete existing plays for this match
      await tx.delete(plays)
        .where(eq(plays.matchId, matchId))
        .execute();
      
      // Map new players, preserving goals from existing players
      const playersToInsert = newPlayers.map((player: PlayData) => ({
        userId: player.userId,
        matchId: player.matchId,
        team: player.team || '',
        goals: player.goals ?? existingPlays.find((ep: Play) => ep.userId === player.userId)?.goals ?? 0
      }));
      
      // Insert all players in a single batch
      return await tx.insert(plays)
        .values(playersToInsert)
        .returning()
        .execute();
    });

    return result.map((p: Play) => ({
      userId: p.userId,
      matchId: p.matchId,
      team: p.team || '',
      goals: p.goals || 0
    }));
  } catch (err) {
    console.error('Transaction failed:', err);
    throw err;
  }
}