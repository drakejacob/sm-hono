import { FC } from "hono/jsx"
import { db, schema } from "../../../db"
import { eq, asc } from "drizzle-orm"

export const SpeakersList: FC = async (props) => {
	const ACTIVE_SPEAKERSLIST_ID = "IDspeakerslist"

	const speakers = await db.query.speakerslistAttendees.findMany({
		where: eq(
			schema.speakerslistAttendees.speakerslistId,
			ACTIVE_SPEAKERSLIST_ID
		),
		orderBy: [asc(schema.speakerslistAttendees.joinedAt)],
		with: {
			attendee: true
		}
	})

	console.log("speakers", speakers)

	const pendingSpeakers = speakers.filter((speaker) => !speaker.leftAt)

	console.log("pendingspeakers", pendingSpeakers)

	//const returningSpeakers = pendingSpeakers.filter(speaker => pendingSpeakers.find(s => s.attendeeId === speaker.attendeeId && s.leftAt))

	//const firstTimeSpeakers = pendingSpeakers.filter(speaker => !returningSpeakers.find(s => s.attendeeId === speaker.attendeeId))

	let returningSpeakers: typeof pendingSpeakers = []
	let firstTimeSpeakers: typeof pendingSpeakers = []

	pendingSpeakers.forEach((speaker) => {
		if (
			speakers.find((s) => s.attendeeId === speaker.attendeeId && s.leftAt)
		) {
			returningSpeakers.push(speaker)
		} else {
			firstTimeSpeakers.push(speaker)
		}
	})

	console.log("returning", returningSpeakers)
	console.log("timeSpeakers", firstTimeSpeakers)

	return (
		<div class="grid w-fit grid-cols-[2fr_3fr]">
			<div class="col-span-2">
				Currently speaking
				<p class="text-[40px] font-bold">
					{firstTimeSpeakers[0]?.attendee.nickName ?? ""}
				</p>
			</div>

			<div>
				{firstTimeSpeakers.slice(1).map(({ attendee }) => {
					return <p>{attendee.nickName}</p>
				})}
			</div>

			<div class="pl-4 pt-4 font-bold">
				Returning speakers
				{returningSpeakers.map(({ attendee }) => {
					return (
						<p>
							<p class="font-normal text-slate-400">
								{attendee.nickName}
							</p>
						</p>
					)
				})}
			</div>

			<div class="col-span-2 mt-4 flex justify-center">
				<button>Remove me! Add me!</button>
			</div>
		</div>
	)
}
