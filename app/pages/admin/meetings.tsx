import { Store } from "$app"
import { Hono } from "hono"

export const adminMeetings = new Hono<{ Variables: Store }>()

adminMeetings.get("/", async (c) => {
	return c.render(<div>Meetings</div>)
})
