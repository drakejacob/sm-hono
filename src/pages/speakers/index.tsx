import { Hono } from "hono"
import { Base } from "../../layouts/Base"

export const speakers = new Hono()

speakers.get("/", (c) => {
	return c.html(
		<Base>
			<div>this is speakers</div>
		</Base>
	)
})
