import { FC } from "hono/jsx"

const links = [
	{ title: "Agenda", href: "/agenda" },
	{ title: "Speakers", href: "/speakers" },
	{ title: "Voting", href: "/voting" }
] as const

export const Header: FC<{ urlPath: string }> = (props) => {
	return (
		<header class="flex items-center justify-between bg-sky-900 text-slate-50 dark:bg-slate-300 dark:text-slate-800">
			<logo class="font-logo px-4 py-3 text-[38px]">SM</logo>
			<button
				type="button"
				class="flex h-full items-center gap-2 rounded-none text-[18px] font-light drop-shadow-none"
				x-on:click="navOpen = !navOpen"
			>
				<div class="i-heroicons-bars-3 text-[2rem]"></div>
				<div>{getTitleFromPath(props.urlPath)}</div>
			</button>
		</header>
	)
}

const getTitleFromPath = (path: string) => {
	const title = links.find((link) => link.href === path)?.title
	return title ?? "Unknown"
}

export const HeaderList: FC<{ name: string }> = (props) => {
	return (
		<ul class="w-50 absolute right-0 -z-10 h-full bg-sky-900 text-slate-50">
			<div class="p-4">
				<span>In meeting as </span>
				<span>{props.name}</span>
			</div>
			{links.map((link) => (
				<li class="cursor-pointer transition-colors hover:bg-sky-800 active:bg-sky-700">
					<a class="block p-4" href={link.href}>
						{link.title}
					</a>
				</li>
			))}
			<button class="font-size-inherit w-full rounded-none bg-rose-900 py-4 hover:bg-rose-800 active:bg-rose-700">
				Leave
			</button>
		</ul>
	)
}
