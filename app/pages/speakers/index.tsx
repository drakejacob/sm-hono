import { Store } from "$app"
import { MainLayout } from "$app/layouts/Main"
import { db, schema } from "$db"
import { Speakers, SpeakersList, SpeakersListButton } from "./SpeakersList"
import { eq, asc, and, isNull } from "drizzle-orm"
import { Hono } from "hono"
import { SSEStreamingApi, streamSSE } from "hono/streaming"

export const speakers = new Hono<{ Variables: Store }>()

speakers.get("/list", (c) => {
	return c.html(<SpeakersList c={c}></SpeakersList>)
})

speakers.get("/button", (c) => {
	return c.html(<SpeakersListButton c={c}></SpeakersListButton>)
})

export function updateSpeakersListStream(message?: string) {
	speakersListStreams.forEach((stream) => {
		stream.writeSSE({
			data: message ?? "Speakers list updated",
			event: "speakerslist"
		})
	})
}

const speakersListStreams: SSEStreamingApi[] = []
speakers.get("/sse", async (c) => {
	return streamSSE(c, async (stream) => {
		speakersListStreams.push(stream)
		console.log(
			"stream added, number of current streams: ",
			speakersListStreams.length
		)

		stream.onAbort(() => {
			// this does not seem to do anything. The stream is not removed from the array.
			// Could lead to pushing to too many streams
			const index = speakersListStreams.indexOf(stream)
			if (index !== -1) {
				speakersListStreams.splice(index, 1)
			}
			console.log("stream removed")
		})
	})
})

// All routes below this require a registered attendee
speakers.use("*", async (c, next) => {
	if (!c.get("attendeeId")) {
		return c.redirect("/join")
	}
	await next()
})

speakers.get("/", MainLayout, (c) => {
	return c.render(
		<div hx-ext="sse" sse-connect="/speakers/sse">
			<Speakers c={c}></Speakers>
		</div>
	)
})

speakers.post("/", async (c) => {
	const speakerslistId = c.get("activeSpeakerslistId")
	if (!speakerslistId) return c.text("No active speakers list")

	const attendeeId = c.get("attendeeId")

	const isInSpeakerslist = await db.query.speakerslistAttendees.findFirst({
		where: and(
			eq(schema.speakerslistAttendees.speakerslistId, speakerslistId),
			eq(schema.speakerslistAttendees.attendeeId, attendeeId),
			isNull(schema.speakerslistAttendees.leftAt)
		)
	})

	if (isInSpeakerslist) {
		return c.text("Already in speakers list")
	}

	await db.insert(schema.speakerslistAttendees).values({
		speakerslistId,
		attendeeId
	})

	await updateSpeakersListStream()

	return c.text("Updated speakers list")
})

speakers.delete("/", async (c) => {
	const speakerslistId = c.get("activeSpeakerslistId")
	if (!speakerslistId) return c.text("No active speakers list")

	const attendeeId = c.get("attendeeId")

	// if currently speaking, set finishedSpeakingAt and leftAt
	const removeFinishedSpeaker = await db
		.update(schema.speakerslistAttendees)
		.set({
			finishedSpeakingAt: new Date(),
			leftAt: new Date(),
			isCurrentlySpeaking: false
		})
		.where(
			and(
				eq(schema.speakerslistAttendees.speakerslistId, speakerslistId),
				eq(schema.speakerslistAttendees.attendeeId, attendeeId),

				isNull(schema.speakerslistAttendees.leftAt),
				isNull(schema.speakerslistAttendees.finishedSpeakingAt),
				eq(schema.speakerslistAttendees.isCurrentlySpeaking, true)
			)
		)
		.returning()
		.get()

	// if not currently speaking, set leftAt
	const removedAttendee = await db
		.update(schema.speakerslistAttendees)
		.set({
			leftAt: new Date()
		})
		.where(
			and(
				eq(schema.speakerslistAttendees.speakerslistId, speakerslistId),
				eq(schema.speakerslistAttendees.attendeeId, attendeeId),

				isNull(schema.speakerslistAttendees.leftAt)
			)
		)
		.returning()
		.get()

	if (!removedAttendee || !removeFinishedSpeaker) {
		c.text("Not in speakers list")
	}

	await updateSpeakersListStream()

	return c.text("Updated speakers list")
})
