import { FC } from "hono/jsx"

export const Header: FC = (props) => {
	return (
		<header class="flex items-center justify-between bg-sky-800 text-slate-50">
			<logo class="px-3 py-1 font-logo text-[38px]">SM</logo>
			<button
				type="button"
				class="flex h-full items-center gap-2 rounded-none text-[18px] font-light drop-shadow-none"
			>
				<div class="h-10">Text</div>
			</button>
		</header>
	)
}
