import { pgTable, serial, varchar, foreignKey, integer, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().notNull(),
	username: varchar({ length: 255 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
});

export const matches = pgTable("matches", {
	id: serial().notNull(),
	scoreLocal: integer("score_local").notNull(),
	scoreAway: integer("score_away").notNull(),	
	timestamp: timestamp("timestamp", { mode: 'string' }).notNull(),
	mvp: integer("mvp"),
	location: varchar({ length: 255 }).notNull(),
	finished: boolean("finished").notNull().default(false),
	creatorId: integer("creator_id").notNull(),
	isPublic: boolean("is_public").notNull().default(false),
}, (table: any) => [	foreignKey({
			columns: [table.mvp],
			foreignColumns: [users.id],
			name: "fk_match_mvp"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.creatorId],
			foreignColumns: [users.id],
			name: "fk_match_creator"
		}).onDelete("cascade"),
]);

export const plays = pgTable("plays", {
	userId: integer("user_id").notNull(),
	matchId: integer("match_id").notNull(),
	goals: integer(),
	team: varchar({ length: 255 }),
}, (table: any) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_plays_user"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.matchId],
			foreignColumns: [matches.id],
			name: "fk_plays_match"
		}).onDelete("cascade"),
]);

export const inviteLinks = pgTable("invite_links", {
	id: serial("id").primaryKey(),
	matchId: integer("match_id").notNull(),
	code: varchar("code", { length: 255 }).notNull().unique(),
	createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	expiresAt: timestamp("expires_at").notNull(),
}, (table: any) => [
	foreignKey({	
		columns: [table.matchId],
		foreignColumns: [matches.id],
		name: "fk_invite_links_match"
	}).onDelete("cascade"),
]);
