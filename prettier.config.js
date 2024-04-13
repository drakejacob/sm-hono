/** @type {import("prettier").Config} */
const config = {
	tabWidth: 3,
	useTabs: true,
	semi: false,
	trailingComma: "none",
	plugins: [
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-tailwindcss"
	]
}

export default config
