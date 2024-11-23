import { exit } from "node:process";
import type { Plugin } from 'vite'
import { merge } from 'ts-deepmerge'

import { proccessFiles, type IProccessFilesOpts } from "./core/proccessFiles";

const getDefaultOpts = () => ({
  ignores: [ /node_modules/ ]
})

type IVitePluginFileTransformerOpts = Partial<IProccessFilesOpts> & Pick<IProccessFilesOpts, 'transforms' | 'patterns'>

const validateOpts = ( opts: IVitePluginFileTransformerOpts ) => {
  if(opts.transforms.length === 0) {
    throw new Error('transforms array is empty')
  }
}

export const vitePluginFilesTransformer = ( optsIn: IVitePluginFileTransformerOpts ): Plugin => {
  try {
    const opts =  merge( getDefaultOpts(), optsIn )
    opts.patterns = opts.patterns.map( pattern => 'dist/' + pattern )
    validateOpts(opts)

    return {
      name: 'files-transformer',
      closeBundle: async () => {
        await proccessFiles( opts )
      }
    }
  } catch(err) {
    console.error( new Error('Catch an error during vitePluginFilesTransformer initializing', { cause: { err }}))
    exit(1)
  }
}
