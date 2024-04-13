import { sql } from "drizzle-orm"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const attendees = sqliteTable("attendees", {
	id: text("id")
		.primaryKey()
		.default(sql`(hex(randomblob(8)))`),
	firstName: text("firstName").notNull(),
	nickName: text("nickName").notNull(),
	lastName: text("lastName").notNull(),
	yearAdmitted: integer("yearAdmitted"),
	isMember: integer("isMember", { mode: "boolean" }).notNull().default(false),
	attendedOnlyMaster: integer("attendedOnlyMaster", {
		mode: "boolean"
	})
		.notNull()
		.default(false),
	joinedAt: integer("joinedAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	leftAt: integer("leftAt", { mode: "timestamp" })
})
