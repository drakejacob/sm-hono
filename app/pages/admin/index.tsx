import { db, schema } from "$db"
import { JWT_KEY, Store } from "../.."
import { updateSpeakersListStream } from "../speakers"
import { adminMeetings } from "./meetings"
import { zValidator } from "@hono/zod-validator"
import { env } from "bun"
import { and, asc, eq, isNull } from "drizzle-orm"
import { Hono } from "hono"
import { setCookie, deleteCookie, getCookie } from "hono/cookie"
import { sign, verify } from "hono/jwt"
import { z } from "zod"

console.log("ADMIN_PASSWORD", env.ADMIN_PASSWORD)

export const admin = new Hono<{ Variables: Store }>()

admin
	.get("/login", (c) => {
		return c.render(
			<main>
				<form
					class="grid place-items-center gap-4 pt-8"
					hx-post={"/admin/login" + c.req.query("redirected")}
					hx-swap="none"
				>
					{c.req.query("error") !== undefined && (
						<div class="text-red">Wrong password</div>
					)}
					{c.req.query("redirected") !== undefined && (
						<div class="text-red">
							You need to log in to access this page
						</div>
					)}
					<input type="password" name="password" placeholder="Password" />
					<button type="submit">Login</button>
				</form>
			</main>
		)
	})
	.post(
		zValidator(
			"form",
			z.object({
				password: z.string()
			})
		),
		async (c) => {
			const body = await c.req.parseBody()

			console.log("body.password", body.password)
			console.log("ADMIN_PASSWORD_IN_MW", env.ADMIN_PASSWORD)

			if (body.password !== env.ADMIN_PASSWORD) {
				c.header("HX-Redirect", "?error")
				c.status(403)
				return c.text("Wrong password")
			}

			const token = await sign("", JWT_KEY)

			setCookie(c, "admintoken", token, {
				httpOnly: true,
				sameSite: "Strict",
				//secure: true,
				maxAge: 24 * 3600
			})

			c.header("HX-Redirect", "/admin")
			return c.text("Logged in, redirecting...")
		}
	)

admin.get("/logout", (c) => {
	deleteCookie(c, "admintoken")
	c.header("HX-Redirect", "login")
	return c.text("Logged out")
})

admin.use("*", async (c, next) => {
	const cookie = getCookie(c, "admintoken") ?? ""

	console.log("cookie", cookie)

	const token = await verify(cookie, JWT_KEY).catch(() => "error")

	console.log("admin token", token)

	const path = c.req.path

	if (token === "error") {
		return c.redirect("/admin/login?redirected=" + path)
	}

	await next()
})

admin.route("/meetings", adminMeetings)

admin.get("/", (c) => {
	return c.render(
		<div class="flex flex-col">
			Admin page
			<div>
				<button hx-get="/admin/nextspeaker" hx-swap="none">
					Next speaker
				</button>
			</div>
			<div>
				<a class="underline" href="/admin/meetings">
					Manage meetings
				</a>
			</div>
		</div>
	)
})

admin.get("/nextspeaker", async (c) => {
	const speakerslistId = c.get("activeSpeakerslistId")
	if (!speakerslistId) return c.text("No active speakers list")

	// Finish current speaker
	await db
		.update(schema.speakerslistAttendees)
		.set({
			finishedSpeakingAt: new Date(),
			leftAt: new Date(),
			isCurrentlySpeaking: false
		})
		.where(
			and(
				eq(schema.speakerslistAttendees.speakerslistId, speakerslistId),
				eq(schema.speakerslistAttendees.isCurrentlySpeaking, true)
			)
		)

	// Get current queues
	const speakers = await db.query.speakerslistAttendees.findMany({
		where: eq(schema.speakerslistAttendees.speakerslistId, speakerslistId),
		orderBy: [asc(schema.speakerslistAttendees.joinedAt)]
	})

	const pendingSpeakers = speakers.filter(
		(speaker) => !speaker.leftAt && !speaker.isCurrentlySpeaking
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

	// Depending on queues
	if (firstTimeSpeakers.length !== 0) {
		await db
			.update(schema.speakerslistAttendees)
			.set({
				isCurrentlySpeaking: true,
				startedSpeakingAt: new Date()
			})
			.where(
				and(
					eq(schema.speakerslistAttendees.speakerslistId, speakerslistId),
					eq(
						schema.speakerslistAttendees.attendeeId,
						firstTimeSpeakers[0].attendeeId
					),
					isNull(schema.speakerslistAttendees.leftAt)
				)
			)
	} else {
		if (returningSpeakers.length !== 0) {
			await db
				.update(schema.speakerslistAttendees)
				.set({
					isCurrentlySpeaking: true,
					startedSpeakingAt: new Date()
				})
				.where(
					and(
						eq(
							schema.speakerslistAttendees.speakerslistId,
							speakerslistId
						),
						eq(
							schema.speakerslistAttendees.attendeeId,
							returningSpeakers[0].attendeeId
						),
						isNull(schema.speakerslistAttendees.leftAt)
					)
				)
		} else {
			// No speakers in queue
		}
	}

	updateSpeakersListStream("Advancing to next speaker from admin")

	return c.text("Pushed data to stream")
})
