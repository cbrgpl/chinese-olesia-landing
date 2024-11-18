import path from 'node:path'
import { cwd } from 'node:process';

export const generateNewFileName = (originalPath: string, suffix: string | null, extension: string) => {
  const originalCwdRelativePathToDir = path.relative(cwd(), path.dirname(originalPath))
  const originalFileName = path.basename(originalPath, path.extname(originalPath))

  const originalRelativePath = `${originalCwdRelativePathToDir}${path.sep}${originalFileName}`

  return suffix ? `${originalRelativePath}.${suffix}.${extension}` : `${originalRelativePath}.${extension}`;
}
