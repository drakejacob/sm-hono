import { Hono } from "hono"
import { Base } from "../../layouts/Base"
import { Header } from "../../components/Header"
import { db } from "../../../db"

export const speakers = new Hono()

speakers.get("/", (c) => {

	db.query.speakerslistAttendees.findMany({
		where: {
			attendeeId: "me"
		}
	}).then((attendees) => {
		const imOnTheList = attendees.length > 0
	
	})

	return c.html(
		<Base>
			<Header></Header>
			<div>this is speakers</div>
			<div class="grid w-fit grid-cols-[2fr_3fr]">
				<div class="col-span-2">
					Currently speaking
					<p class="text-[40px] font-bold">
						{speakersList.new[0] ? getNameFromUser(speakersList.new[0]) : ""}
					</p>
				</div>

				<div>
					{#each speakersList.new.slice(1).map(getNameFromUser) as newSpeaker}
						<p>{newSpeaker}</p>
					{/each}
				</div>

				<div class="pl-4 pt-4 font-bold">
					Returning speakers
					{#each speakersList.returning.map(getNameFromUser) as returningSpeaker}
						<p class="font-normal text-slate-400">{returningSpeaker}</p>
					{/each}
				</div>

				<div class="flex justify-center col-span-2 mt-4">
					<button
						on:click={() => {
						if (imOnTheList) {
							eden.speakers["remove-me"].post()
						} else {
							eden.speakers["add-me"].post()
						}
						}}
					>
						{#if imOnTheList}
						Remove me!
						{:else}
						Add me!
						{/if}
					</button>
				</div>
			</div>
		</Base>
	)
})

speakers.get("/list", (c) => {

})
