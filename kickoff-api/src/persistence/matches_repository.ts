import { matches, plays, users } from "../drizzle/schema.js";
import { eq , and } from "drizzle-orm";
import UnexistingUserError from "../types/UnexistingUserError.js";
import { db } from "./db.js";

type Match = typeof matches.$inferSelect;
type User = typeof users.$inferSelect;
type Play = typeof plays.$inferSelect;

type MatchWithCreator = Match & { creatorUsername: string | null };

export async function getMatchById(id: number): Promise<MatchWithCreator | null> {
  const result = await db.select().from(matches).where(eq(matches.id, id))
    .execute();
  if (!result[0]) return null;
  // Get creator username
  const creatorId = result[0].creatorId;
  const userResult = await db.select().from(users).where(
    eq(users.id, creatorId),
  ).execute();
  const creatorUsername = userResult[0]?.username || null;
  return { ...result[0], creatorUsername };
}

export async function getMatchesByUser(userId: number): Promise<Match[]> {
  const userIdResult = await db.select().from(users).where(eq(users.id, userId))
    .execute();
  if (!userIdResult[0]) throw new UnexistingUserError(userId);
  const result = await db.select().from(matches).innerJoin(
    plays,
    eq(plays.matchId, matches.id),
  ).where(eq(plays.userId, userId)).execute();
  // Return only the match objects, not the join result
  return result.map((r: { matches: Match; plays: Play }) => r.matches);
}

export async function createMatch(
  matchTime: string,
  location: string,
  userId: number,
  isPublic: boolean
): Promise<Match> {
  const result = await db.insert(matches).values({
    scoreLocal: 0,
    scoreAway: 0,
    timestamp: matchTime,
    mvp: null,
    location: location,
    creatorId: userId,
    finished: false,
    isPublic: isPublic
  }).returning().execute();
  return result[0];
}

export async function deleteMatch(id: number) {
  const result = await db.delete(matches).where(eq(matches.id, id)).execute();
  return result;
}

export async function updateMatch(
  id: number,
  scoreLocal: number,
  scoreAway: number,
  timestamp: string,
  mvp: number | null,
  finished: boolean = false,
  isPublic: boolean = false,
) {
  const result = await db.update(matches).set({
    scoreLocal,
    scoreAway,
    timestamp,
    mvp,
    finished,
    isPublic
  }).where(eq(matches.id, id)).execute();
  return result;
}

export async function getAllMatches(): Promise<Match[]> {
  const result = await db.select().from(matches).execute();
  return result;
}

export async function getMatches(): Promise<Match[]> {
  const result = await db.select().from(matches).where(and(eq(matches.finished, false), eq(matches.isPublic, true))).execute();
  return result;
}

