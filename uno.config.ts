import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetWebFonts({
      provider: "bunny",
      fonts: {
        serif: "Bitter"
      },
    }),
  ],
})