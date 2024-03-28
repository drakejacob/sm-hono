import { Hono } from "hono"
import { Base } from "../../layouts/Base"
import { Header, HeaderList } from "../../components/Header"
import { db, schema } from "../../../db"
import { eq, asc } from "drizzle-orm"
import { Variables } from "hono/types"
import { jsxRenderer, useRequestContext } from "hono/jsx-renderer"
import { SpeakersList } from "./SpeakersList"

export const speakers = new Hono<{ Variables: Variables }>()

speakers.get("/:id", async (c) => {
	const id = c.req.param("id")

	/*const attendee = await db.query.attendees.findFirst({
		where: eq(schema.attendees.id, id)
	})*/

	const attendee = await db
		.select()
		.from(schema.attendees)
		.where(eq(schema.attendees.id, id))
		.get()

	if (!attendee) {
		return c.render(<div>Attendee with id {id} not found</div>)
	}

	return c.render(
		<div>
			This is the data for attendee with id {id}
			<p>First name: {attendee.firstName}</p>
			<p>Nickname: {attendee.nickName}</p>
			<p>Nickname: {attendee.lastName}</p>
		</div>
	)
})

speakers.use(
	"*",
	jsxRenderer(({ children, Layout }) => {
		const c = useRequestContext()
		return (
			<Layout>
				<div
					class="transition-margin absolute right-0 flex h-screen w-full flex-col"
					x-data="{ navOpen: false }"
					x-bind:class="navOpen ? 'mr-50' : ''"
				>
					<Header urlPath={c.req.path}></Header>
					<main class="flex flex-1 flex-col items-center bg-white p-6">
						{children}
					</main>
				</div>
				<HeaderList></HeaderList>
			</Layout>
		)
	})
)

speakers.get("/", (c) => {
	return c.render(<SpeakersList></SpeakersList>)
})

speakers.get("/list", (c) => {
	return c.html(<SpeakersList></SpeakersList>)
})

speakers.get("/listsse", (c) => {
	return c.render(<div>Listsse</div>)
})

speakers.get("advance", (c) => {
	return c.render(<div>Advance</div>)
})
