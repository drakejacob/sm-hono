import { Hono } from "hono"
import { setCookie, deleteCookie } from "hono/cookie"
import { jwt, sign } from "hono/jwt"
import { JWT_KEY, Variables } from "../.."
import { speakersListStream } from "../speakers"
import { db, schema } from "../../../db"
import { and, asc, eq, isNull } from "drizzle-orm"
import { env } from "bun"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

export const admin = new Hono<{ Variables: Variables }>()

admin
	.get("/login", (c) => {
		console.log(c.req.query("error"))

		return c.render(
			<main>
				<form
					class="grid place-items-center gap-4 pt-8"
					hx-post="login"
					hx-swap="none"
				>
					{c.req.query("error") !== undefined && (
						<div class="text-red">Wrong password</div>
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

			if (body.password !== env.ADMIN_PASSWORD) {
				return c.redirect("/login?error")
			}

			//TODO finish login

			const token = await sign({}, JWT_KEY)
			setCookie(c, "admintoken", token, { httpOnly: true })

			return c.redirect("/admin")
		}
	)

admin.get("/logout", (c) => {
	deleteCookie(c, "admintoken")
	return c.redirect("/login")
})

admin.use(
	"*",
	jwt({
		cookie: "admintoken",
		secret: JWT_KEY
	})
)

admin.get("/", (c) => {
	return c.render(
		<div>
			Admin page
			<button hx-post="pushsse" hx-swap="none">
				Push data to stream
			</button>
		</div>
	)
})

admin.post("/pushsse", async (c) => {
	// Here is one implementation
	// if (!speakersListStream) {
	// 	if (c.req.query("afterinit") === "true") {
	// 		c.status(503)
	// 		return c.text("Stream failed to initialize")
	// 	}

	// 	const baseUrl = c.req.url.replace(c.req.path, "")
	// 	fetch(baseUrl + "/speakers/listsse?afterinit=true")
	// 	await fetch(baseUrl + "/admin/pushsse")
	// 	return c.text("Initialized stream and pushed data")
	// }

	// If the stream doesn't exist, it means no one has connected to it yet
	// No need to send out any data to the stream in that case
	if (!speakersListStream) {
		c.status(503)
		return c.text("No clients listening to the stream")
	}

	speakersListStream.writeSSE({
		data: "Hello from admin"
	})

	return c.text("Pushed data to stream")
})

admin.get("/nextspeaker", async (c) => {
	const currentSpeaker = await db.query.speakerslistAttendees.findFirst({
		where: and(
			eq(schema.speakerslistAttendees.speakerslistId, "IDspeakerslist"),
			isNull(schema.speakerslistAttendees.leftAt)
		),
		orderBy: [asc(schema.speakerslistAttendees.joinedAt)]
	})

	if (!currentSpeaker) {
		return c.text("Speakers list is empty")
	}

	db.update(schema.speakerslistAttendees)
		.set({
			leftAt: new Date()
		})
		.where(
			and(
				eq(schema.speakerslistAttendees.speakerslistId, "IDspeakerslist"),
				eq(
					schema.speakerslistAttendees.attendeeId,
					currentSpeaker.attendeeId
				),
				isNull(schema.speakerslistAttendees.leftAt)
			)
		)

	if (!speakersListStream) {
		c.status(503)
		return c.text("No clients listening to the stream")
	}

	speakersListStream.writeSSE({
		data: "Hello from admin"
	})

	return c.text("Pushed data to stream")
})
