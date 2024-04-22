import { relations, sql } from "drizzle-orm"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { meetings } from "./meeting"

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
	leftAt: integer("leftAt", { mode: "timestamp" }),
	isReadyToMoveOn: integer("isReadyToMoveOn", { mode: "boolean" })
		.notNull()
		.default(false),
	meetingId: text("meetingId").notNull().references(() => meetings.id)
})

export const attendeeRelations = relations(attendees, ({ one }) => ({
	meeting: one(meetings, {
		fields: [attendees.meetingId],
		references: [meetings.id]
	})
}))
