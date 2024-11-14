/* eslint-env node */
import path from 'path'
import { defineConfig } from 'vite'

import tsconfigPaths from 'vite-tsconfig-paths'

import viteImagemin from '@vheemstra/vite-plugin-imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminWebp from 'imagemin-webp'
import imageminSvgo from 'imagemin-svgo'

const VITE_IMAGEMIN_EXCLUDE =  [/\.gen/, 'node_modules']

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
        svg: imageminSvgo()
      },
      exclude: VITE_IMAGEMIN_EXCLUDE,
      makeWebp: {
        formatFilePath: ( filePath ) => {
          const ext = path.extname(filePath)
          return filePath.replace(ext, '') + '.gen.webp'
        },

        plugins: {
          jpg: imageminWebp({ quality: 75 }),
        },
      },
    }),
    viteImagemin({
      formatFilePath: ( filePath ) => {
        const ext = path.extname(filePath)
        return filePath.replace(ext, '') + '.low.gen' + ext
      },
      exclude: VITE_IMAGEMIN_EXCLUDE,
      plugins: {
        jpg: imageminMozjpeg({
          quality: 5
        }),
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve( __dirname, 'src' ),
      '@styles': path.resolve(__dirname, 'src', 'styles')
    },
  },
} )
