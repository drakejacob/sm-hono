import { sql, relations } from "drizzle-orm"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { attendees } from "./attendee"

export const speakerslist = sqliteTable("speakerslist", {
	id: text("id")
		.primaryKey()
		.default(sql`(hex(randomblob(8)))`),
	name: text("name").notNull(),
	openedAt: integer("openedAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	closedAt: integer("closedAt", { mode: "timestamp" })
})

export const speakerslistAttendees = sqliteTable("speakerslistAttendees", {
	speakerslistId: text("speakerslistId")
		.notNull()
		.references(() => speakerslist.id),
	attendeeId: text("attendeeId")
		.notNull()
		.references(() => attendees.id),
	joinedAt: integer("joinedAt", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	leftAt: integer("leftAt", { mode: "timestamp" }),
	startedSpeakingAt: integer("startedSpeakingAt", { mode: "timestamp" }),
	finishedSpeakingAt: integer("finishedSpeakingAt", { mode: "timestamp" }),
	isCurrentlySpeaking: integer("isCurrentlySpeaking", { mode: "boolean" })
		.notNull()
		.default(false)
})

export const speakerslistAttendeesRelations = relations(
	speakerslistAttendees,
	({ one }) => ({
		speakerslist: one(speakerslist, {
			fields: [speakerslistAttendees.speakerslistId],
			references: [speakerslist.id]
		}),
		attendee: one(attendees, {
			fields: [speakerslistAttendees.attendeeId],
			references: [attendees.id]
		})
	})
)
