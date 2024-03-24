import { sql } from "drizzle-orm"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { idFunction } from ".."

export const attendees = sqliteTable("attendees", {
	id: text("id")
		.primaryKey()
		.default(sql`${idFunction}`),
	firstName: text("firstName").notNull(),
	nickName: text("nickName").notNull(),
	lastName: text("lastName").notNull(),
	yearAdmitted: integer("yearAdmitted"),
	isMember: integer("isMember", { mode: "boolean" }).default(false),
	attendedOnlyMaster: integer("attendedOnlyMaster", {
		mode: "boolean"
	}).default(false),
	joinedAt: integer("joinedAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	leftAt: integer("leftAt", { mode: "timestamp" })
})

export const Attendee = attendees.$inferSelect
