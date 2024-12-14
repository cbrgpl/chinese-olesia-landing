/* eslint-env node */
import path from 'path';
import { defineConfig } from 'vite';

import tsconfigPaths from 'vite-tsconfig-paths';

import imageminSvgo from 'imagemin-svgo';

import type { ITransform } from './vite_plugins';
import { vitePluginFilesTransformer } from './vite_plugins';
import { toLowQuality, toWebp } from './vite_plugins/defaultTransforms';

const toMinifiedSvgCore = imageminSvgo({});
const toMinifiedSvg: ITransform = {
  name: 'svg-minification',
  getNewFilePath: (filePath) => filePath,
  transform: (value) => toMinifiedSvgCore(value),
};

export default defineConfig({
  root: './',

  build: {
    sourcemap: true,
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
  },

  plugins: [
    tsconfigPaths(),
    vitePluginFilesTransformer({
      transforms: [toWebp, toLowQuality],
      patterns: ['**/*.{jpg,webp}'],
      ignores: ['.gen'],
    }),
    vitePluginFilesTransformer({
      transforms: [toMinifiedSvg],
      patterns: ['**/*.svg'],
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@styles': path.resolve(__dirname, 'src', 'styles'),
    },
  },
});
