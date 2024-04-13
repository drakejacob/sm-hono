import { Store } from "$app"
import { MainLayout } from "$app/layouts/Main"
import { Hono } from "hono"

export const agenda = new Hono<{ Variables: Store }>()

agenda.get("/", MainLayout, (c) => {
	return c.render(<div>Agenda</div>)
})
