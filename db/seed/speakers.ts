import { db, schema } from "$db"
import { ATTENDEE1_ID, ATTENDEE2_ID, ATTENDEE3_ID, MEETING_ID } from "./meeting"

export async function seedSpeakers() {
	await db.delete(schema.attendees)

	await db.insert(schema.attendees).values({
		id: ATTENDEE1_ID,
		firstName: "Gaba",
		nickName: "Gaba",
		lastName: "Gaba",
		isReadyToMoveOn: true,
		meetingId: MEETING_ID,
	})

	await db.insert(schema.attendees).values({
		id: ATTENDEE2_ID,
		firstName: "Janne",
		nickName: "Janne",
		lastName: "Janne",
		isReadyToMoveOn: true,
		meetingId: MEETING_ID,
	})

	await db.insert(schema.attendees).values({
		id: ATTENDEE3_ID,
		firstName: "Greta",
		nickName: "Greta",
		lastName: "Greta",
		isReadyToMoveOn: false,
		meetingId: MEETING_ID,
	})

	await db.delete(schema.speakerslist)

	await db.insert(schema.speakerslist).values({
		id: "IDspeakerslist",
		name: "Gaba Goats"
	})

	await db.delete(schema.speakerslistAttendees)

	const now = new Date()

	await db.insert(schema.speakerslistAttendees).values({
		speakerslistId: "IDspeakerslist",
		attendeeId: "IDgaba",
		joinedAt: now,
		leftAt: new Date(now.getTime() + 1000)
	})

	await db.insert(schema.speakerslistAttendees).values({
		speakerslistId: "IDspeakerslist",
		attendeeId: "IDjanne",
		joinedAt: new Date(now.getTime() + 2000)
	})

	await db.insert(schema.speakerslistAttendees).values({
		speakerslistId: "IDspeakerslist",
		attendeeId: "IDgaba",
		joinedAt: new Date(now.getTime() + 3000)
	})

	await db.insert(schema.speakerslistAttendees).values({
		speakerslistId: "IDspeakerslist",
		attendeeId: "IDgreta",
		joinedAt: new Date(now.getTime() + 4000)
	})
}
