import { sql } from "drizzle-orm"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { idFunction } from ".."
import { attendees } from "./attendee"

export const speakerslist = sqliteTable("speakerslist", {
	id: text("id")
		.primaryKey()
		.default(sql`${idFunction}`),
	name: text("name").notNull()
})

export const speakerslistAttendees = sqliteTable("speakerslistAttendees", {
	speakerslistId: text("speakerslistId")
		.notNull()
		.references(() => speakerslist.id),
	attendeeId: text("attendeeId")
		.notNull()
		.references(() => attendees.id),
	joinedAt: integer("joinedAt", { mode: "timestamp" }).notNull(),
	leftAt: integer("leftAt", { mode: "timestamp" })
})
