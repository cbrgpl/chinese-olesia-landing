export type ITransform = {
  name: string;
  getNewFilePath: ( filePath: string ) => string;
  transform: ( value: Buffer ) => Promise<Uint8Array> | Uint8Array
}

// TODO Make all using Uint8Array
export type IFile<T extends Buffer | Uint8Array> = {
  content: T;
  path: string;
}

export type ITransformedFile<T extends Buffer | Uint8Array> =  IFile<T> & {
  transformationName: string;
  processingTime: number;
}

export type IGenerateFileNames = {
  original: string;
  generated: string[]
}
