import { Store } from "$app"
import { getReadyCount } from "$app/pages/ready"
import { db, schema } from "$db"
import { eq } from "drizzle-orm"
import { Context } from "hono"
import { FC } from "hono/jsx"

export const ReadyCounter: FC<{
	c: Context<{ Variables: Store }>
}> = async ({ c }) => {
	const meetingId = c.get("activeMeetingId")
	if (!meetingId) {
		return <div class="error">Meeting not found</div>
	}

	const meetingWithAttendees = await db.query.meetings.findFirst({
		where: eq(schema.meetings.id, meetingId),
		with: {
			attendees: true,
		}
	})

	if (!meetingWithAttendees) {
		return <div class="error">Meeting not found in database</div>
	}

	const votingAttendeesCount = meetingWithAttendees.attendees.length
	const readyToMoveOnCount = await getReadyCount() ?? -1

	// TODO: attendee count needs to update as new people join

	return (
		<div class="bg-slate-700 w-full p-4"
			hx-ext="sse"
			sse-connect="/ready/sse"
		>
			<span sse-swap="readycounter" hx-swap="innerHTML">{readyToMoveOnCount}</span> out of
			<span> {votingAttendeesCount} </span>attendees are ready to move on

			<div
				hx-get="/ready/button"
				hx-swap="innerHTML"
				hx-trigger="sse:readycounter"
			>
				<ReadyCounterButton c={c}></ReadyCounterButton>
			</div>
		</div>
	)
}

export const ReadyCounterButton: FC<{
	c: Context<{ Variables: Store }>
}> = async ({ c }) => {
	const attendeeId = c.get("attendeeId")
	if (!attendeeId) {
		return <div class="error">Unauthorized</div>
	}

	const attendee = await db.query.attendees.findFirst({
		where: eq(schema.attendees.id, attendeeId)
	})
	if (!attendee) {
		return <div class="error">Attendee not found</div>
	}

	if (attendee.isReadyToMoveOn) {
		return (
			<button
				class="bg-rose-700 hover:bg-rose-600 active:bg-rose-500"
				hx-put="/ready/false"
				hx-swap="none"
			>
				Unready
			</button>
		)
	} else {
		return (
			<button
				class="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-500"
				hx-put="/ready/true"
				hx-swap="none"
			>
				Ready up
			</button>
		)

	}
}
