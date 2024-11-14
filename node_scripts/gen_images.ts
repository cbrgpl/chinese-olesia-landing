import path from 'path'
import fs from 'fs/promises'
import { glob } from 'glob'

import pPipe from 'p-pipe';
import imageminWebp from 'imagemin-webp'
import imageminMozjpeg from 'imagemin-mozjpeg'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { cwd, exit } from 'process';

import { handleSettledResult } from './utils/handleSettledResult.js'

const CWD = cwd()

const generateNewFileName = (originalPath: string, suffix: string | null, extension: string) => {
  const originalCwdRelativePathToDir = path.relative(CWD, path.dirname(originalPath))
  const originalFileName = path.basename(originalPath, path.extname(originalPath))

  const originalRelativePath = `${originalCwdRelativePathToDir}${path.sep}${originalFileName}`

  return suffix ? `${originalRelativePath}.${suffix}.${extension}` : `${originalRelativePath}.${extension}`;
}

const toWebp = pPipe<Buffer, Uint8Array>(imageminWebp({ quality: 50 }) as any)
const toLowQuality = pPipe<Buffer, Uint8Array>(imageminMozjpeg({ quality: 5 }) as any)

type IFile<T extends Buffer | Uint8Array> = {
  content: T;
  path: string;
}
type IPathsMap = Map<string, boolean>
type ITransform = {
  name: string;
  getNewFilePath: ( filePath: string ) => string;
  transform: ( value: Buffer ) => Promise<Uint8Array> | Uint8Array
}
class FilesTransformer {
  private readonly _transforms: ITransform[]

  constructor( transforms: ITransform[] ) {
    this._transforms = transforms
  }

  async transform( file: IFile<Buffer> ): Promise<Array<IFile<Uint8Array>>> {
    const promises = []

    for(const { transform, getNewFilePath, name } of this._transforms) {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          const newPath = getNewFilePath(file.path)
          const content = await transform(file.content)

          const transformedFile: IFile<Uint8Array> = { content, path: newPath }

          resolve(transformedFile)
        } catch(err) {
          reject(new Error('An error was catched during file transformation', {
            cause: {
              err,
              transform: name,
              file: file.path
            }
          }))
        }
      }))
    }

    const results = await Promise.allSettled(promises)
    const files =  handleSettledResult<IFile<Uint8Array>>(results, 'Some transformations were not passed successfully')

    return files
  }

  getGeneratedFilePaths( filePath: string ) {
    return this._transforms.map( ({ getNewFilePath}) => getNewFilePath( filePath ))
  }

}

const transformer = new FilesTransformer([
  {
    name: 'webp',
    getNewFilePath: ( filePath: string ) => generateNewFileName(filePath, null, 'gen.webp'),
    transform: ( value ) => toWebp(value)
  },
  {
    name: "low",
    getNewFilePath: ( src ) => generateNewFileName(src, 'low', 'gen.jpg'),
    transform: ( value ) => toLowQuality(value)
  }
] as ITransform[] )

const pathsArr2Map = ( paths: string[] ) => {
  const map: IPathsMap = new Map()
  for(const path of paths) {
    map.set(path, false)
  }
  return map
}

const getFilesPaths = async ( globPatterns: string[] ) => {
  try {
    const files = await glob(globPatterns)
    return files
  } catch(err) {
    throw new Error('An error happend while trying to collect files using glob', {
      cause: {
        globPatterns: globPatterns,
        originalErr: err
      }
    })
  }
}

const getNonGeneratedFiles = ( filePaths: string[] ) => {
  const filePathsMap = pathsArr2Map(filePaths)

  for(const path of filePaths) {
    transformer.getGeneratedFilePaths(path).forEach( genPath => {
      if(filePathsMap.has(genPath)) {
        filePathsMap.set(genPath, true)
      }
    })
  }

  const nonGeneratedPaths: string[] = []
  for(const path of  filePaths) {
    if(!filePathsMap.get(path)) {
      nonGeneratedPaths.push(path)
    }
  }

  return nonGeneratedPaths
}

const generateCompressedImages = async (globPatterns: string[] ) => {
  try {
    const allFilesPaths = await getFilesPaths(globPatterns)
    const nonGeneratedFilePaths = getNonGeneratedFiles( allFilesPaths )

    const filesReadingResults = await Promise.allSettled(
      nonGeneratedFilePaths.map( path => new Promise<IFile<Buffer>>(
        async ( resolve, reject ) => {
          const file = await fs.readFile(path)
          resolve({
            content: file,
            path,
          })
    })))

    const files = handleSettledResult<IFile<Buffer>>( filesReadingResults, 'Some errors happend during reading of original files' )

    const transformedFilesResults = await Promise.allSettled(files.map(( file ) => transformer.transform( file )))
    const transformedFiles = handleSettledResult(transformedFilesResults, 'Some errors happend during files transforming ').flat()

    for(const file of transformedFiles) {
      try {
        await fs.writeFile(file.path, file.content)
      } catch(err) {
        console.error(new Error("Failed to write file", { cause: {
          path: file.path,
          err
        }}))
      }
    }

  } catch (err) {
    console.error(err)
    exit(1)
  }
}



const argv = yargs(hideBin(process.argv))
  .option('input-patterns', {
    alias: 'ip',
    type: "string",
    description: "Files search pattern",
    demandOption: true,
  })
  .help()
  .alias('help', 'h')
  .argv

generateCompressedImages(argv['input-patterns'].split(';'));
