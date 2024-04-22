import { db, schema } from "$db"

export async function seedSpeakers() {
	await db.delete(schema.attendees)

	await db.insert(schema.attendees).values({
		id: "IDgaba",
		firstName: "Gaba",
		nickName: "Gaba",
		lastName: "Gaba"
	})

	await db.insert(schema.attendees).values({
		id: "IDjanne",
		firstName: "Janne",
		nickName: "Janne",
		lastName: "Janne"
	})

	await db.insert(schema.attendees).values({
		id: "IDgreta",
		firstName: "Greta",
		nickName: "Greta",
		lastName: "Greta"
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
