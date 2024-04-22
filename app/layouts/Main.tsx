import { CurrentAgendaPoint } from "$app/components/CurrentAgendaPoint"
import { Header, HeaderList } from "$app/components/Header"
import { jsxRenderer, useRequestContext } from "hono/jsx-renderer"

export const MainLayout = jsxRenderer(({ children, Layout }) => {
	const c = useRequestContext()

	const displayName = c.get("displayName")

	return (
		<Layout>
			<div
				class="transition-margin absolute right-0 flex h-screen w-full flex-col"
				x-data="{ navOpen: false }"
				x-bind:class="navOpen ? 'mr-50' : ''"
			>
				<Header urlPath={c.req.path}></Header>
				<CurrentAgendaPoint c={c}></CurrentAgendaPoint>
				<main class="flex flex-1 flex-col items-center bg-slate-50 p-6 dark:bg-slate-950">
					{children}
				</main>
			</div>
			<HeaderList name={displayName}></HeaderList>
		</Layout>
	)
})
