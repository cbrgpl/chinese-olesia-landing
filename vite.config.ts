/* eslint-env node */
import path from 'path'
import { defineConfig } from 'vite'

import tsconfigPaths from 'vite-tsconfig-paths'

import imageminSvgo from 'imagemin-svgo'

import { vitePluginFilesTransformer, ITransform } from './vite_plugins'
import { toLowQuality, toWebp } from './vite_plugins/defaultTransforms'

const toMinifiedSvgCore = imageminSvgo({})
const toMinifiedSvg: ITransform = {
  name: 'svg-minification',
  getNewFilePath: ( filePath ) => filePath,
  transform: ( value ) => toMinifiedSvgCore(value)
}

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
    vitePluginFilesTransformer({
      transforms: [
        toWebp,
        toLowQuality
      ],
      patterns: [ '**/*.{jpg,webp}' ],
      ignores: [ '.gen' ]
    }),
    vitePluginFilesTransformer({
      transforms: [
        toMinifiedSvg
      ],
      patterns: [ '**/*.svg' ],
    }),

    // viteImagemin({
    //   plugins: {
    //     jpg: imageminMozjpeg(),
    //     svg: imageminSvgo()
    //   },
    //   exclude: VITE_IMAGEMIN_EXCLUDE,
    //   makeWebp: {
    //     formatFilePath: ( filePath ) => {
    //       const ext = path.extname(filePath)
    //       return filePath.replace(ext, '') + '.gen.webp'
    //     },

    //     plugins: {
    //       jpg: imageminWebp({ quality: 75 }),
    //     },
    //   },
    // }),
    // viteImagemin({
    //   formatFilePath: ( filePath ) => {
    //     const ext = path.extname(filePath)
    //     return filePath.replace(ext, '') + '.low.gen' + ext
    //   },
    //   exclude: VITE_IMAGEMIN_EXCLUDE,
    //   plugins: {
    //     jpg: imageminMozjpeg({
    //       quality: 5
    //     }),
    //   },
    // }),
  ],

  resolve: {
    alias: {
      '@': path.resolve( __dirname, 'src' ),
      '@styles': path.resolve(__dirname, 'src', 'styles')
    },
  },
} )
