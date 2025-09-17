import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { matches, plays, users, inviteLinks } from "../drizzle/schema.js";

const { Pool } = pg;

// Setup logging for database operations
export const dbLogger = {
  info: (message: string, ...args: unknown[]) => console.log(`[DB INFO] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[DB WARN] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`[DB ERROR] ${message}`, ...args),
  debug: (message: string, ...args: unknown[]) => console.debug(`[DB DEBUG] ${message}`, ...args)
};

let connectionString;
if (process.env.NODE_ENV === 'production') {
  dbLogger.info("Using production environment for database connection");
  if (process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD) {
    dbLogger.info("Using environment variables for database connection");
    connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@db:5432/kickoff`;
  } else {
    if (!process.env.POSTGRES_USER) {
      dbLogger.warn("POSTGRES_USER is not set");
      process.exit(1);
    }
    if (!process.env.POSTGRES_PASSWORD) {
      dbLogger.warn("POSTGRES_PASSWORD is not set");
      process.exit(1);
    }
  }
} else {
  dbLogger.info("Using development environment for database connection");
  connectionString = "postgresql://postgres:postgres@localhost:5432/kickoff";
}


// Log connection details (without password)
dbLogger.info("Initializing shared database connection");
dbLogger.info(`Connection string: ${connectionString}`);

// Create shared connection pool
export const pool = new Pool({
  connectionString,
  // Add connection parameters for better stability
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Add event listeners
pool.on('connect', () => {
  dbLogger.info('New database connection established');
});

pool.on('error', (err: Error) => {
  dbLogger.error('Unexpected error on idle client', err);
});

// Export the database connection with all schemas
export const db = drizzle({
  client: pool,
  schema: {
    matches,
    plays,
    users,
    inviteLinks
  }
});

// Test the connection at startup
export async function testDatabaseConnection() {
  try {
    dbLogger.info("Testing database connection...");
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as result');
    await client.release();

    if (result.rows[0]?.result === 1) {
      dbLogger.info("✅ Successfully connected to database");
      return true;
    } else {
      dbLogger.error("❌ Database connection test returned unexpected result");
      return false;
    }
  } catch (error) {
    dbLogger.error("❌ Failed to connect to database:", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}

testDatabaseConnection().then(success => {
  if (!success) {
    dbLogger.error("Exiting application due to database connection failure");
    process.exit(1);
  } else {
    dbLogger.info("Database connection is healthy");
  }
});
