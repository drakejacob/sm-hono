import { Store } from "$app"
import { MainLayout } from "$app/layouts/Main"
import { db, schema } from "$db"
import { getAllAgendaNodes, getJsxFromAgendaNodes } from "./functions"
import { Hono } from "hono"

export const agenda = new Hono<{ Variables: Store }>()

agenda.use("*", async (c, next) => {
	await next()
})

agenda.get("/", MainLayout, async (c) => {
	const activeMeetingId = c.get("activeMeetingId")
	if (!activeMeetingId) {
		return c.render(<div class="error">Meeting not found</div>)
	}

	const allAgendaNodes = await getAllAgendaNodes(activeMeetingId)

	return c.render(getJsxFromAgendaNodes(allAgendaNodes))
})
