import { drizzle } from "drizzle-orm/node-postgres";
import { matches, plays, users } from "../../drizzle/schema.js";
import pg from "pg";

type Match = typeof matches.$inferSelect;
type Play = typeof plays.$inferSelect;
type User = typeof users.$inferSelect;

const { Pool } = pg;

export default async function insertData(): Promise<void> {
  if (!process.env.DATABASE_URL || process.env.NODE_ENV == "development") {
    console.warn("Using default local database.");
  } 
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/kickoff",
  });

  const db = drizzle({
    client: pool,
    schema: { matches, plays, users },
  });

  await db.delete(matches).execute();
  await db.delete(plays).execute();
  await db.delete(users).execute();

  await db.insert(users).values([
    { id: 2, username: "testuser1", password: "password1", email: "testuser1@example.com" },
    { id: 3, username: "testuser2", password: "password2", email: "testuser2@example.com" },
  ]).execute();

  await db.insert(matches).values([
    {
      id: 1,
      scoreLocal: 0,
      scoreAway: 0,
      timestamp: new Date().toISOString(),
      mvp: null,
      location: "Test Location",
      finished: false,
      creatorId: 2,
      isPublic: true
    },
    {
      id: 2,
      scoreLocal: 0,
      scoreAway: 0,
      timestamp: new Date().toISOString(),
      mvp: null,
      location: "Test Location 2",
      finished: false,
      creatorId: 2,
      isPublic: false
    }
  ]).execute();

  await db.insert(plays).values([
    { userId: 2, matchId: 1, goals: 0, team: "A" },
  ]).execute();



  console.log(
    "Amount of test users:",
    await db.select().from(users).execute().then((res: User[]) => res.length),
  );
  console.log(
    "Amount of test matches:",
    await db.select().from(matches).execute().then((res: Match[]) => res.length),
  );
  console.log(
    "Amount of test plays:",
    await db.select().from(plays).execute().then((res: Play[]) => res.length),
  );

  await db.execute(
    `SELECT setval('matches_id_seq', (SELECT MAX(id) FROM "matches"))`,
  );

  await db.execute(
    `SELECT setval('users_id_seq', (SELECT MAX(id) FROM "users"))`,
  );

  await db.execute(
    `SELECT setval('invite_links_id_seq', (SELECT MAX(id) FROM "invite_links"))`,
  );


  // Close the pool to prevent TCP connection leaks
  await pool.end();
}

await insertData();
