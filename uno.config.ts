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
		presetUno({
			dark: "media"
		}),
		presetIcons({
			extraProperties: {
				display: "inline-block",
				"vertical-align": "middle"
			}
		})
		// presetWebFonts({
		// 	provider: "bunny",
		// 	fonts: {
		// 		serif: "Bitter"
		// 	}
		// })
	],
	theme: {
		fontFamily: {
			logo: ["Delta", "display"],
			serif: ["Bitter", "serif"]
		}
	}
})
