import pPipe from 'p-pipe';
import imageminWebp from 'imagemin-webp'
import sharp from 'sharp'

import type { ITransform } from './types';
import { generateNewFileName } from './utils/generateNewFileName';

const toWebpCore = pPipe<Buffer, Uint8Array>(imageminWebp({ quality: 50 }) as any)
/** @description uses imageminWebp */
const toWebp: ITransform = {
  name: 'webp',
  getNewFilePath: ( filePath: string ) => generateNewFileName(filePath, null, 'gen.webp'),
  transform: ( value ) => toWebpCore(value)
}

// TODO ADD SVGO MINIFACATION USING imagemin-svgo
// TODO ADD POSSIBILITY TO FILTER HANDLED BY TRANSFORMATION FILES USING REGXP/STRINGS FILTRATION PLUS FIX TOTAL ORIGINAL SIZE OUTPUT. THE SAME FILE GIVES SIZE TO MULTIPLE TRANSFORMATIONS IT NEEDS TO BE HANDLED TO INCLUDE ONE FILE IN TOTAL ONCE
const toLowQualityCore = async ( file: Buffer ): Promise<Uint8Array> => {
  const proccessedFile = await sharp(file).resize({
    width: 60,
  })
  .blur(6)
  .jpeg({
    quality: 80,
  })
  .toBuffer()

  return new Uint8Array(proccessedFile)
}
/** @description uses sharp */
const toLowQuality: ITransform = {
  name: "low",
  getNewFilePath: ( src ) => generateNewFileName(src, 'low', 'gen.jpg'),
  transform: ( value ) => toLowQualityCore(value)
}

export {
  toWebp,
  toLowQuality
}
