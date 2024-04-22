import { Store, getActiveMeeting } from "$app"
import { SSEStreamingApi, streamSSE } from "hono/streaming"
import { SpeakersList, SpeakersListButton } from "../speakers/SpeakersList"
import { Hono } from "hono"
import { db, schema } from "$db"
import { eq } from "drizzle-orm"
import { attendees } from "$db/schema/attendee"
import { ReadyCounterButton } from "$app/components/ReadyCounter"

export const ready = new Hono<{ Variables: Store }>()

ready.get("/", async (c) => {
	const attendeeId = c.get("attendeeId")
	if (!attendeeId) {
		c.status(401)
		return c.text("Unauthorized")
	}

	const attendee = await db.query.attendees.findFirst({
		where: eq(schema.attendees.id, attendeeId)
	})
	if (!attendee) {
		c.status(404)
		return c.text("Attendee not found")
	}

	if (attendee.isReadyToMoveOn) {
		return c.html(<span
			class="text-rose-600"
			hx-trigger="sse:readycounter"
			hx-get="/ready"
			hx-swap="outerHTML">
			Unready
		</span>)
	} else {
		return c.html(<span
			class="text-emerald-600"
			hx-trigger="sse:readycounter"
			hx-get="/ready"
			hx-swap="outerHTML">
			Ready up
		</span>)
	}
})

ready.get("/button", async (c) => {
	return c.html(<ReadyCounterButton c={c}></ReadyCounterButton>)
})

ready.put("/true", async (c) => {
	const attendeeId = c.get("attendeeId")
	if (!attendeeId) {
		c.status(401)
		return c.text("Unauthorized")
	}

	await db.update(attendees).set({
		isReadyToMoveOn: true
	}).where(eq(schema.attendees.id, attendeeId))

	updateReadyCounterStream()

	return c.text("Set ready to true")
})

ready.put("/false", async (c) => {
	const attendeeId = c.get("attendeeId")
	if (!attendeeId) {
		c.status(401)
		return c.text("Unauthorized")
	}

	await db.update(attendees).set({
		isReadyToMoveOn: false
	}).where(eq(schema.attendees.id, attendeeId))

	updateReadyCounterStream()

	return c.text("Set ready to false")
})

ready.get("/count", async (c) => {
	const votingAttendeesCount = await getReadyCount() ?? -1

	return c.text(votingAttendeesCount.toString())
})

export async function updateReadyCounterStream() {

	const votingAttendeesCount = await getReadyCount() ?? -1

	readyCounterStreams.forEach((stream) => {
		stream.writeSSE({
			data: votingAttendeesCount.toString(),
			event: "readycounter"
		})
	})
}

const readyCounterStreams: SSEStreamingApi[] = []
ready.get("/sse", async (c) => {
	return streamSSE(c, async (stream) => {
		readyCounterStreams.push(stream)
		console.log(
			"stream added for readycounter, number of current streams: ",
			readyCounterStreams.length
		)

		stream.onAbort(() => {
			// this does not seem to do anything. The stream is not removed from the array.
			// Could lead to pushing to too many streams
			const index = readyCounterStreams.indexOf(stream)
			if (index !== -1) {
				readyCounterStreams.splice(index, 1)
			}
			console.log("stream removed")
		})
	})
})

export async function getReadyCount() {
	const activeMeetingId = (await getActiveMeeting())?.id
	if (!activeMeetingId) {
		console.error("No active meeting found for Ready Counter stream")
		return
	}

	const activeMeeting = await db.query.meetings.findFirst({
		where: eq(schema.meetings.id, activeMeetingId),
		with: {
			attendees: true
		}
	})
	if (!activeMeeting) {
		console.error("No active meeting found for Ready Counter stream")
		return
	}

	console.log("attendees", activeMeeting.attendees)

	const votingAttendeesCount = activeMeeting.attendees.filter(
		(attendee) =>
			!attendee.leftAt &&
			attendee.isMember &&
			attendee.isReadyToMoveOn
	).length

	return votingAttendeesCount
}