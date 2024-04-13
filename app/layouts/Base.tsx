import { FC } from "hono/jsx"

export const Base: FC = (props) => {
	return (
		//<!-- Developed by Jacob "Drake" Bengtsson 2024 -->
		<html lang="en">
			<head>
				<link rel="stylesheet" href="/css/gen/reset.css" />
				<link rel="stylesheet" href="/css/gen/main.css" />
				<link rel="stylesheet" href="/css/gen/uno.css" />
				<script src="/htmx.min.js"></script>
				<script src="/htmx.sse.js"></script>
				<script src="/alpine.min.js" defer></script>
				<title>Big webpage</title>
			</head>
			<body class="bg-slate-50 font-serif text-slate-800 dark:bg-slate-950 dark:text-slate-300">
				{props.children}
			</body>
		</html>
	)
}
