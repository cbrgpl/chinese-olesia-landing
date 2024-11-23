import fs from 'node:fs/promises'
import { glob } from 'glob'

import type { IFile } from '../types'
import { allSettledWrapper } from './../utils/allSettledWrapper'

/** @description if ignored returns true */
const getIgnoreChecker = (ignores: (string|RegExp)[] ) => ( file: string ) => ignores.some( ignorePattern => {
  if(typeof ignorePattern === 'string' ) {
    return file.includes(ignorePattern)
  }

  return !!ignorePattern.exec(file)
})

export class FileSystemManipulator {
  static async getFilesPaths( globPatterns: string[], ignores: (string|RegExp)[] ): Promise<string[]> {
    try {
      console.log(globPatterns)
      const files = await glob(globPatterns)
      const fileIgnored = getIgnoreChecker( ignores )
      const notIgnored = files.filter( file => !fileIgnored(file))
      return notIgnored
    } catch(err) {
      throw new Error('An error happend while trying to collect files using glob', {
        cause: {
          globPatterns: globPatterns,
          originalErr: err
        }
      })
    }
  }

  static async readFiles( filePaths: string[] ): Promise<IFile<Buffer>[]> {
    const promises = filePaths.map( filePath => new Promise<IFile<Buffer>>(
      async ( resolve, reject ) => {
        try {
          const file = await fs.readFile(filePath)
          resolve({
            content: file,
            path: filePath,
          })
        } catch( err ) {
          reject( new Error('An error happend while reading a file', { cause: {
            err,
            filePath,
          }}))
        }
    }))
    const readedFiles = await allSettledWrapper( promises )

    return readedFiles
  }

  static async writeFile( file: IFile<Uint8Array> ) {
    try {
      await fs.writeFile(file.path, file.content)
    } catch(err) {
      throw new Error('An error happend while writing a file', {
        cause: {
          err,
          filePath: file.path
        }
      })
    }
  }
}
