import { Store } from "$app"
import { Hono } from "hono"

export const theme = new Hono<{ Variables: Store }>()

theme.get("/", async (c) => {
	return c.render(
		<div class="flex flex-col">
			<h1>This is a H1 heading</h1>
			<h2>This is a H2 heading</h2>
			<h3>This is a H3 heading</h3>
			<h4>This is a H4 heading</h4>
			<h5>This is a H5 heading</h5>
			<h6>This is a H6 heading</h6>

			<p>This is a paragraph</p>

			<button>Button</button>

			<input type="text" placeholder="Text input" />

			<textarea>Textarea</textarea>

			<div class="p-2">
				<div class="bg-sky-950 p-2">950</div>
				<div class="bg-sky-900 p-2">900</div>
				<div class="bg-sky-800 p-2">800</div>
				<div class="bg-sky-700 p-2">700</div>
				<div class="bg-sky-600 p-2">600</div>
				<div class="bg-sky-500 p-2">500</div>
				<div class="bg-sky-400 p-2">400</div>
				<div class="bg-sky-300 p-2">300</div>
				<div class="bg-sky-200 p-2">200</div>
				<div class="bg-sky-100 p-2">100</div>
				<div class="bg-sky-50 p-2">50</div>

				<div class="bg-slate-950 p-2">950</div>
				<div class="bg-slate-900 p-2">900</div>
				<div class="bg-slate-800 p-2">800</div>
				<div class="bg-slate-700 p-2">700</div>
				<div class="bg-slate-600 p-2">600</div>
				<div class="bg-slate-500 p-2">500</div>
				<div class="bg-slate-400 p-2">400</div>
				<div class="bg-slate-300 p-2">300</div>
				<div class="bg-slate-200 p-2">200</div>
				<div class="bg-slate-100 p-2">100</div>
				<div class="bg-slate-50 p-2">50</div>
			</div>
		</div>
	)
})
