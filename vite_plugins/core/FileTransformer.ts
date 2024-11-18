import type { ITransform, IFile, ITransformedFile, IGenerateFileNames } from '../types/index'
import { allSettledWrapper } from '../utils/allSettledWrapper'

export class FileTransformer {
  private readonly _transforms: ITransform[]

  constructor( transforms: ITransform[] ) {
    this._transforms = transforms
  }

  async transform( file: IFile<Buffer> ): Promise<Array<ITransformedFile<Uint8Array>>> {
    const promises = []

    for(const { transform, getNewFilePath, name } of this._transforms) {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          const startTime = performance.now()
          const newPath = getNewFilePath(file.path)
          const content = await transform(file.content)

          const endTime = performance.now()
          const transformedFile: ITransformedFile<Uint8Array> = {
            content,
            path: newPath,
            transformationName: name,
            processingTime: endTime - startTime
          }

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

    const files = allSettledWrapper<ITransformedFile<Uint8Array>>(promises, 'Some transformations were not passed successfully')
    return files
  }

  getGeneratedFilePaths( filePath: string ): IGenerateFileNames {
    return {
      original: filePath,
      generated: this._transforms.map( ({ getNewFilePath}) => getNewFilePath( filePath ))
    }
  }

}
