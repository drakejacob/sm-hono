import { Base } from "$app/layouts/Base"
import { admin } from "$app/pages/admin"
import { agenda } from "$app/pages/agenda"
import { join } from "$app/pages/join"
import { speakers } from "$app/pages/speakers"
import { theme } from "$app/pages/theme"
import { db, schema } from "$db"
import { env } from "bun"
import { ready } from "$app/pages/ready"
import { randomBytes } from "crypto"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import { getCookie } from "hono/cookie"
import { jsxRenderer } from "hono/jsx-renderer"
import { verify } from "hono/jwt"

export var JWT_KEY = randomBytes(64).toString("hex")

export function getDisplayName(attendee?: {
	firstName: string
	lastName: string
	nickName: string
}) {
	if (!attendee) return ""
	return attendee.nickName || attendee.firstName || attendee.lastName
}

export type Store = {
	attendeeId: string
	displayName: string
	activeMeetingId: string | null
	activeSpeakerslistId: string | null
}

const app = new Hono<{ Variables: Store }>()

app.use("*", async (c, next) => {
	c.set("activeSpeakerslistId", "IDspeakerslist")

	const activeMeetingId = (await getActiveMeeting())?.id ?? null
	c.set("activeMeetingId", activeMeetingId)

	const token = getCookie(c, "attendeetoken")
	if (!token) {
		return await next()
	}

	const attendeeId =
		((await verify(token, JWT_KEY).catch(() => "")) as string) ?? ""

	const attendee = await db.query.attendees.findFirst({
		where: eq(schema.attendees.id, attendeeId)
	})

	if (!attendee) {
		return await next()
	}

	c.set("attendeeId", attendeeId)
	const displayName = getDisplayName(attendee)
	c.set("displayName", displayName)
	await next()
})

app.use(
	jsxRenderer(({ children }) => {
		return <Base>{children}</Base>
	})
)

app.route("/admin", admin)
app.route("/agenda", agenda)
app.route("/join", join)
app.route("/ready", ready)
app.route("/speakers", speakers)
app.route("/theme", theme)

app.get("/", (c) => {
	const meeting = {
		name: "Meeting 1",
		location: "HC4",
		time: "10:00"
	}

	return c.render(
		<main class="flex w-full flex-1 flex-col items-center justify-center gap-4 pt-[25vh]">
			<style>
				{`
					@keyframes fade-in {
						from {
							opacity: 0;
						}
					}

					@keyframes fade-out {
						to {
							opacity: 0;
						}
					}

					@keyframes slide-from-right {
						from {
							transform: translateX(90px);
						}
					}

					@keyframes slide-to-left {
						to {
							transform: translateX(-90px);
						}
					}

					.slide-it {
						view-transition-name: slide-it;
					}

					::view-transition-old(slide-it) {
						animation:
							180ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
							600ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
					}
					::view-transition-new(slide-it) {
						animation:
							420ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
							600ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
					}
				`}
			</style>

			<p class="font-logo text-[15rem]">SM</p>
			<div class="pb-4">
				{meeting.name} started at {meeting.time} in {meeting.location}
			</div>

			<form class="flex gap-2" action="/join">
				<input
					class="w-60"
					type="text"
					name="name"
					placeholder="Your name"
				/>
				<button type="submit">
					<div class="i-heroicons-arrow-right"></div>
				</button>
			</form>
		</main>
	)
})

app.use("/*", serveStatic({ root: "./static" }))

app.all("*", (c) => {
	return c.render(<div>404 missing</div>)
})

export default app

export async function getActiveMeeting() {
	const meetings = await db.query.meetings.findMany()
	if (meetings.length === 0) {
		//return new Error("No meetings found")
		return null
	}
	meetings.filter((meeting) => meeting.endDate === null)
	meetings.sort((a, b) => (a.startDate >= b.startDate ? 1 : -1))
	return meetings[0]
}
