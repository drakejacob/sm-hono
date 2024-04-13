import { Hono } from "hono"
import { JWT_KEY, Store } from "../.."
import { FC } from "hono/jsx"
import { sign } from "hono/jwt"
import { db, schema } from "$db"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { setCookie } from "hono/cookie"

function getNames(input: string): {
	firstName: string
	nickName: string
	lastName: string
} {
	input = input.trim().replace(/\s+/g, " ")

	const qutoesCount = input.match(/["']/g)?.length
	if (qutoesCount && qutoesCount >= 2) {
		const names = input.split(/["']/)
		const trimmedNames = names.map((name) => name.trim())

		return {
			firstName: trimmedNames[0],
			nickName: trimmedNames[1],
			lastName: trimmedNames[2]
		}
	}

	const names = input.split(" ")

	if (names.length === 1) {
		return {
			firstName: "",
			nickName: names[0],
			lastName: ""
		}
	}

	if (names.length === 2) {
		return {
			firstName: names[0],
			nickName: "",
			lastName: names[1]
		}
	}

	if (names.length >= 3) {
		return {
			firstName: names[0],
			nickName: names[1],
			lastName: names[2]
		}
	}

	return {
		firstName: "",
		nickName: "",
		lastName: ""
	}
}

export const join = new Hono<{ Variables: Store }>()

join.get("/", (c) => {
	const name = c.req.query("name") ?? ""
	return c.render(<Section1 name={name}></Section1>)
})

join.get("/raw", (c) => {
	const name = c.req.query("name") ?? ""
	return c.html(<Section1 name={name}></Section1>)
})

const Section1: FC<{
	name: string
}> = (props) => {
	const names = getNames(props.name)

	const currentDate = new Date()
	let listStartYear = currentDate.getFullYear() - 1

	if (currentDate.getMonth() >= 7) {
		listStartYear = currentDate.getFullYear()
	}

	return (
		<section class="flex flex-col items-center justify-center">
			<h1 class="text-4xl">Join</h1>
			Is this your name?
			<form class="flex flex-col" hx-post="/join">
				<input
					type="text"
					name="firstName"
					placeholder="Name"
					value={names.firstName}
				/>
				<input
					type="text"
					name="nickName"
					placeholder="Nick"
					value={names.nickName}
				/>
				<input
					type="text"
					name="lastName"
					placeholder="Surname"
					value={names.lastName}
				/>

				<select name="yearAdmitted" id="">
					{Array.from({ length: 10 }, (_, i) => (
						<option value={listStartYear - i}>{listStartYear - i}</option>
					))}
				</select>
				<p class="cursor-pointer underline">I'm older</p>
				<input type="input" name="yearAdmitted" />

				<label>
					I'm a member of the student division
					<input type="checkbox" name="isMember" checked />
				</label>
				<label>
					I've only attended the master program
					<input type="checkbox" name="attendedOnlyMaster" value="false" />
				</label>

				<button type="submit">Continue</button>
			</form>
		</section>
	)
}

join.post(
	"/",
	zValidator(
		"form",
		z
			.object({
				firstName: z.string(),
				nickName: z.string(),
				lastName: z.string(),
				yearAdmitted: z.coerce.number(),
				isMember: z.string().optional(),
				attendedOnlyMaster: z.string().optional()
			})
			.refine(
				(data) =>
					Boolean(data.firstName) ||
					Boolean(data.nickName) ||
					Boolean(data.lastName),
				{
					message:
						"At least one of firstName, nickName, or lastName must have a value"
				}
			)
	),
	async (c) => {
		const data = c.req.valid("form")

		const { attendeeId } = await db
			.insert(schema.attendees)
			.values({
				firstName: data.firstName,
				nickName: data.nickName,
				lastName: data.lastName,
				yearAdmitted: data.yearAdmitted,
				isMember: !!data.isMember,
				attendedOnlyMaster: !!data.attendedOnlyMaster
			})
			.returning({ attendeeId: schema.attendees.id })
			.get()

		const token = await sign(attendeeId, JWT_KEY)

		setCookie(c, "attendeetoken", token, {
			httpOnly: true,
			sameSite: "Strict",
			//secure: true,
			maxAge: 24 * 3600
		})

		c.header("HX-Redirect", "/speakers")
		return c.text("Set token")
	}
)
