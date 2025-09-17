import { relations } from "drizzle-orm/relations";
import { users, matches, plays } from "./schema.js";

export const matchRelations = relations(matches, ({one, many}) => ({	user: one(users, {
		fields: [matches.mvp],
		references: [users.id]
	}),
	plays: many(plays),
}));

export const usersRelations = relations(users, ({many}) => ({
	matches: many(matches),
	plays: many(plays),
}));

export const playsRelations = relations(plays, ({one}) => ({
	user: one(users, {
		fields: [plays.userId],
		references: [users.id]
	}),
	match: one(matches, {
		fields: [plays.matchId],
		references: [matches.id]
	}),
}));