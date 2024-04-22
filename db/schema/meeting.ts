import { relations, sql } from "drizzle-orm"
import {
	sqliteTable,
	text,
	integer,
	AnySQLiteColumn
} from "drizzle-orm/sqlite-core"

export const meetings = sqliteTable("meetings", {
	id: text("id")
		.primaryKey()
		.default(sql`(hex(randomblob(8)))`),
	name: text("name").notNull(),
	location: text("location").notNull(),
	startDate: integer("startDate", { mode: "timestamp" }).notNull(),
	endDate: integer("endDate", { mode: "timestamp" })
})

export const meetingRelations = relations(meetings, ({ many }) => ({
	agendaNodes: many(agendaNodes)
}))

export const agendaNodes = sqliteTable("agendaNode", {
	id: text("id")
		.primaryKey()
		.default(sql`(hex(randomblob(8)))`),
	name: text("name").notNull(),
	startedAt: integer("startedAt", { mode: "timestamp" }),
	endedAt: integer("endedAt", { mode: "timestamp" }),
	parentNodeId: text("parentNodeId").references(
		(): AnySQLiteColumn => agendaNodes.id
	),
	orderInParent: integer("orderInParent").notNull(),
	notes: text("notes").notNull(),
	meetingId: text("meetingId")
		.notNull()
		.references(() => meetings.id)
})

export type AgendaNode = typeof agendaNodes.$inferSelect

export const agendaNodeRelations = relations(agendaNodes, ({ one, many }) => ({
	agendaNodes: many(agendaNodes),
	meeting: one(meetings, {
		fields: [agendaNodes.meetingId],
		references: [meetings.id]
	})
}))
