-- Create the database if it does not exist and connect to it
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kickoff') THEN
      PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE kickoff');
   END IF;
END$$;

\c kickoff
-- SQL script to create the database tables
-- Force database recreation with stronger cleanup

-- Terminate any sessions that might be using the tables
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'kickoff'
AND pid <> pg_backend_pid();

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS invite_links CASCADE;
DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create Match table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    score_local INT NOT NULL,
    score_away INT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    mvp INT NULL REFERENCES users(id) ON DELETE SET NULL,
    location VARCHAR(255) NOT NULL,
    finished BOOLEAN NOT NULL DEFAULT FALSE,
    creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create Plays table (join table between users and matches)
CREATE TABLE IF NOT EXISTS plays (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    goals INT,
    team VARCHAR(255),
    PRIMARY KEY(user_id, match_id)
);

-- Create Invite Links table
CREATE TABLE IF NOT EXISTS invite_links (
    id SERIAL PRIMARY KEY,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    code VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plays_user_id ON plays(user_id);
CREATE INDEX IF NOT EXISTS idx_plays_match_id ON plays(match_id);
CREATE INDEX IF NOT EXISTS idx_match_creator_id ON matches(creator_id);
CREATE INDEX IF NOT EXISTS idx_invite_links_match_id ON invite_links(match_id);
CREATE INDEX IF NOT EXISTS idx_invite_links_code ON invite_links(code);