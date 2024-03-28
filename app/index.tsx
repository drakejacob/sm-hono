import { Hono } from "hono"
import { Base } from "./layouts/Base"
import { Main } from "./layouts/Main"
import { serveStatic } from "hono/bun"
import { speakers } from "./pages/speakers"
import { verify } from "hono/jwt"
import { getCookie } from "hono/cookie"
import { randomBytes } from "crypto"
import { jsxRenderer } from "hono/jsx-renderer"

const JWT_KEY = randomBytes(64).toString("hex")

export type Variables = {
	attendeeId: string
	isAuthed: boolean
}

const app = new Hono<{ Variables: Variables }>()

/*app.use("*", async (c, next) => {
	const token = getCookie(c, "token") ?? ""
	/*if (!token) {
		return c.redirect("/login")
	}*/
/*
	const decodedPayload = await verify(token, JWT_KEY)
	console.log(decodedPayload)

	c.set("attendeeId", decodedPayload)
	await next()
})*/

app.use(
	jsxRenderer(({ children }) => {
		return <Base>{children}</Base>
	})
)

/* app.use(
	jsxRenderer(({ children }) => {
		return <Main>{children}</Main>
	})
) */

app.get("/", (c) => {
	return c.render(<div class="text-green">Hejsan på er alla</div>)
})

app.route("/speakers", speakers)

app.use("/*", serveStatic({ root: "./static" }))

app.all("*", (c) => {
	return c.render(<div>404 missing</div>)
})

export default {
	port: 3434,
	fetch: app.fetch
}
