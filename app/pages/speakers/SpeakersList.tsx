import { Store, getDisplayName } from "$app"
import { db, schema } from "$db"
import { eq, asc, and, isNull } from "drizzle-orm"
import { Context } from "hono"
import { FC } from "hono/jsx"

export const Speakers: FC<{ c: Context<{ Variables: Store }> }> = async ({
	c
}) => {
	return (
		<>
			<SpeakersList c={c}></SpeakersList>
			<SpeakersListButton c={c}></SpeakersListButton>
		</>
	)
}

export const SpeakersList: FC<{ c: Context<{ Variables: Store }> }> = async ({
	c
}) => {
	const speakerslistId = c.get("activeSpeakerslistId")
	const attendeeId = c.get("attendeeId")

	const speakerslist = await db.query.speakerslist.findFirst({
		where: eq(schema.speakerslist.id, speakerslistId)
	})

	const speakers = await db.query.speakerslistAttendees.findMany({
		where: eq(schema.speakerslistAttendees.speakerslistId, speakerslistId),
		orderBy: [asc(schema.speakerslistAttendees.joinedAt)],
		with: {
			attendee: true
		}
	})

	const pendingSpeakers = speakers.filter(
		(speaker) => !speaker.leftAt && !speaker.isCurrentlySpeaking
	)

	const currentlySpeaking = speakers.find(
		(speaker) => speaker.isCurrentlySpeaking
	)

	let returningSpeakers: typeof pendingSpeakers = []
	let firstTimeSpeakers: typeof pendingSpeakers = []

	pendingSpeakers.forEach((speaker) => {
		if (
			speakers.find(
				(s) => s.attendeeId === speaker.attendeeId && s.finishedSpeakingAt
			)
		) {
			returningSpeakers.push(speaker)
		} else {
			firstTimeSpeakers.push(speaker)
		}
	})

	return (
		<div
			class="grid w-fit grid-cols-2"
			hx-trigger="sse:speakerslist"
			hx-get="/speakers/list"
			hx-swap="outerHTML"
		>
			<h1>{speakerslist?.name}</h1>

			<div class="col-span-2">
				Currently speaking
				<p
					class={`text-[40px] font-bold ${
						currentlySpeaking ? "underline" : ""
					}`}
				>
					{getDisplayName(currentlySpeaking?.attendee)}
				</p>
			</div>

			<div>
				{firstTimeSpeakers.map((speaker) => (
					<p class={speaker.attendeeId === attendeeId ? "underline" : ""}>
						{getDisplayName(speaker.attendee)}
					</p>
				))}
			</div>

			<div class="pl-4 pt-4 font-bold">
				Returning speakers
				{returningSpeakers.map((speaker) => (
					<p
						class={`
							font-normal text-slate-400 ${
								speaker.attendeeId === attendeeId ? "underline" : ""
							}`}
					>
						{getDisplayName(speaker.attendee)}
					</p>
				))}
			</div>
		</div>
	)
}

export const SpeakersListButton: FC<{
	c: Context<{ Variables: Store }>
}> = async ({ c }) => {
	const attendeeId = c.get("attendeeId")
	const activeSpeakerslistId = c.get("activeSpeakerslistId")

	const imOnTheList = await db.query.speakerslistAttendees.findFirst({
		where: and(
			eq(schema.speakerslistAttendees.speakerslistId, activeSpeakerslistId),
			eq(schema.speakerslistAttendees.attendeeId, attendeeId),
			isNull(schema.speakerslistAttendees.leftAt)
		)
	})

	return (
		<div
			class="col-span-2 mt-4 flex justify-center"
			hx-trigger="sse:speakerslist"
			hx-get="/speakers/button"
			hx-swap="outerHTML"
		>
			{imOnTheList ? (
				<button hx-delete="" hx-swap="none">
					Remove me
				</button>
			) : (
				<button hx-post="" hx-swap="none">
					Add me
				</button>
			)}
		</div>
	)
}
