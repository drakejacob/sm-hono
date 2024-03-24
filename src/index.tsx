import { Hono } from "hono"
import { Base } from "./layouts/Base"
import { serveStatic } from "hono/bun"
import { speakers } from "./pages/speakers"

const app = new Hono()

app.get("/", (c) => {
	return c.html(
		<Base>
			<div class="text-green">Hejsan på er alla</div>
		</Base>
	)
})

app.route("/speakers", speakers)

app.use("/*", serveStatic({ root: "./static" }))

app.all("*", (c) => {
	return c.html(
		<Base>
			<div>404 missing</div>
		</Base>
	)
})

export default {
	port: 3434,
	fetch: app.fetch
}
