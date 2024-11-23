import { IGenerateFileNames } from "../types"

type IPathsMap = Map<string, boolean>
const pathsArr2Map = ( paths: string[] ) => {
  const map: IPathsMap = new Map()
  for(const path of paths) {
    map.set(path, false)
  }
  return map
}
export const getNonGeneratedFiles = ( allFilePaths: string[], generatedFilePaths: IGenerateFileNames[] ) => {
  const filePathsMap = pathsArr2Map(allFilePaths)

  for(const genPaths of generatedFilePaths) {
    genPaths.generated.forEach( genPath => {
      const generatedNameHaveTheSameName = genPath === genPaths.original
      if(generatedNameHaveTheSameName) {
        return
      }

      if(filePathsMap.has(genPath)) {
        filePathsMap.set(genPath, true)
      }
    })
  }

  const nonGeneratedPaths: string[] = []
  for(const path of allFilePaths) {
    if(!filePathsMap.get(path)) {
      nonGeneratedPaths.push(path)
    }
  }

  return nonGeneratedPaths
}
