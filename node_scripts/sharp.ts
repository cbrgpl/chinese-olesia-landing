import sharp from 'sharp'
import fs from 'node:fs/promises'

const TEST_PATHS = [
  'public/unnan_modal_1.jpg',
  'public/unnan_modal_2.jpg',
  'public/unnan_modal_3.jpg'
]

const toLowQuality = async ( file: Buffer ): Promise<Uint8Array> => {
  const proccessedFile = await sharp(file).resize({
    width: 60,
  })
  .blur(10)
  .toBuffer()

  return new Uint8Array(proccessedFile)
}

;(async () => {
  for(const path of TEST_PATHS) {
    const file = await fs.readFile(path)
    const lowQualityFile = await toLowQuality( file )
    fs.writeFile(
      path.replace('.jpg', '.low.gen.jpg'),
      lowQualityFile,
    )
  }
})()
