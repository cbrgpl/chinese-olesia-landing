import { FileTransformer } from './FileTransformer';
import * as fsUtils from '../utils/fsUtils';

import type { ITransform } from '../types';
import { getNonGeneratedFiles } from '../utils/getNonGeneratedFiles';

import { FileTransformationMetrics } from './FileTransformationMetrics';

export type IProccessFilesOpts = {
  patterns: string[];
  transforms: ITransform[];
  ignores: (RegExp | string)[];
};

export const proccessFiles = async (opts: IProccessFilesOpts) => {
  try {
    const fileTransformationMetrics = new FileTransformationMetrics();
    fileTransformationMetrics.addTopics(
      opts.transforms.map((transform) => ({
        topic: transform.name,
      }))
    );

    const allFilePaths = await fsUtils.getFilesPaths(opts.patterns, opts.ignores);
    const transformer = new FileTransformer(opts.transforms);

    const nonGeneratedFilePaths = getNonGeneratedFiles(
      allFilePaths,
      allFilePaths.map((filePath) => transformer.getGeneratedFilePaths(filePath))
    );

    const readedFiles = await fsUtils.readFiles(nonGeneratedFilePaths);

    for (const file of readedFiles) {
      const transformedFiles = await transformer.transform(file);
      transformedFiles.forEach((file) => fsUtils.writeFile(file));
      fileTransformationMetrics.record(file, transformedFiles);
    }

    fileTransformationMetrics.print();
    fileTransformationMetrics.printTopicsSummary();
  } catch (err) {
    console.group('An error happend during files proccessing');
    console.error(err);
    console.groupEnd();
  }
};
