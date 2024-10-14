/* eslint-env node */
import { resolve } from 'path'
import { defineConfig } from 'vite'

import tsconfigPaths from 'vite-tsconfig-paths'

import viteImagemin from '@vheemstra/vite-plugin-imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminWebp from 'imagemin-webp'


export default defineConfig( {
  root: './',

  build: {
    sourcemap: true,
  },

  server: {
    port: 8080,
  },

  plugins: [
    tsconfigPaths(),
    viteImagemin({
      plugins: {
        jpg: imageminMozjpeg(),
      },
      makeWebp: {
      formatFilePath: ( file ) => file.replace(/\.je?pg$/, '') + ".webp",
        plugins: {
          jpg: imageminWebp(),
        },
      },
    }),
  ],

  resolve: {
    alias: {
      '@': resolve( __dirname, 'src' ),
      '@styles': resolve(__dirname, 'src', 'styles')
    },
  },
} )
