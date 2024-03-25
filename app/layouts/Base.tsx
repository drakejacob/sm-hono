import { FC } from "hono/jsx"

export const Base: FC = (props) => {
	return (
		//<!-- Developed by Jacob "Drake" Bengtsson 2024 -->
		<html lang="en">
			<head>
				<link rel="stylesheet" href="/reset.css" />
				<link rel="stylesheet" href="/uno.css" />
				<script src="/htmx.min.js"></script>
				<title>Big webpage</title>
			</head>
			<body class="font-serif">
				<div class="b b-solid b-blue font-bold">Base</div>
				{props.children}
			</body>
		</html>
	)
}
