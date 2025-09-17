import { inviteLinks } from "../drizzle/schema.js";
import { eq, and, lt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./db.js";


type InviteLink = typeof inviteLinks.$inferSelect;


export async function createInviteLink(matchId: number, expiresInHours: number = 24): Promise<InviteLink | undefined> {
    const code = randomBytes(16).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
    const result = await db.insert(inviteLinks).values({
        matchId: matchId,
        code: code,
        expiresAt: sql`${expiresAt}::timestamp`
    }).returning().execute();

    return result[0];
}

export async function validateInviteLink(code: string): Promise<InviteLink | undefined> {
    const result = await db.select()
        .from(inviteLinks)
        .where(and(
            eq(inviteLinks.code, code),
            lt(sql`CURRENT_TIMESTAMP`, inviteLinks.expiresAt)
        ))
        .execute();

    return result[0];
}
