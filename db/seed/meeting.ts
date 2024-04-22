import { db, schema } from "$db"
import { agendaNodes } from "$db/schema/meeting"

export const MEETING_ID = "meetingid"
export const ATTENDEE1_ID = "attendee1id"
export const ATTENDEE2_ID = "attendee2id"
export const ATTENDEE3_ID = "attendee3id"

export async function seedMeeting() {
	await db.delete(schema.meetings)

	await db.insert(schema.meetings).values({
		id: MEETING_ID,
		location: "Tunavägen",
		name: "Lit fam 😎 möte yo",
		startDate: new Date(2024, 3, 3)
	})

	await db.delete(agendaNodes)

	await db.insert(agendaNodes).values({
		meetingId: MEETING_ID,
		name: "Mötets öppnande",
		notes: "",
		orderInParent: 0,
		startedAt: new Date(2024, 3, 4),
		endedAt: new Date(2024, 3, 4, 1)
	})

	const invalmötesordf = await db
		.insert(agendaNodes)
		.values({
			meetingId: MEETING_ID,
			name: "Val av mötesordförande",
			notes: "",
			orderInParent: 1,
			startedAt: new Date(2024, 3, 5),
			endedAt: new Date(2024, 3, 5, 1)
		})
		.returning()
		.get()

	const nomineringarmötesordf = await db
		.insert(agendaNodes)
		.values({
			meetingId: MEETING_ID,
			name: "Nomineringar",
			notes: "",
			orderInParent: 0,
			parentNodeId: invalmötesordf.id,
			startedAt: new Date(2024, 3, 6),
			endedAt: new Date(2024, 3, 6, 1)
		})
		.returning()
		.get()

	await db.insert(agendaNodes).values({
		meetingId: MEETING_ID,
		name: "Love Lindqvist",
		notes: "",
		orderInParent: 0,
		parentNodeId: nomineringarmötesordf.id,
		startedAt: new Date(2024, 3, 7)
	})

	await db.insert(agendaNodes).values({
		meetingId: MEETING_ID,
		name: "Anton Ekström",
		notes: "",
		orderInParent: 1,
		parentNodeId: nomineringarmötesordf.id
	})
}
