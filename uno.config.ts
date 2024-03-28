import {
	defineConfig,
	presetIcons,
	presetUno,
	presetWebFonts,
	transformerDirectives
} from "unocss"

export default defineConfig({
	transformers: [transformerDirectives()],
	presets: [
		presetUno(),
		presetIcons({
			extraProperties: {
				display: "inline-block",
				"vertical-align": "middle"
			}
		}),
		presetWebFonts({
			provider: "bunny",
			fonts: {
				serif: "Bitter"
			}
		})
	],
	theme: {
		fontFamily: {
			logo: ["Delta", "display"]
		}
	}
})
