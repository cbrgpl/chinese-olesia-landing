import path from 'node:path';
import { cwd } from 'node:process';

import { colorPalette } from './../utils/colorPalette';
import type { ITransformedFile, IFile } from '../types';
import { getDiffInPercent } from './../utils/getDiffInPercent';
import { normilizeLength } from '../utils/normilizeLength';

import { ProductivityMertrics, type IMetricRecord, MetricsPrinter, type IMetricsBlock } from './ProductivityMertrics';
import chalk from 'chalk';

type ITransformingMetricRecord = IMetricRecord & {
  get diff(): string;
};

const metricToTransformingMetric = (mainSize: number, metric: IMetricRecord): ITransformingMetricRecord => {
  return {
    ...metric,
    get diff() {
      return getDiffInPercent(mainSize, metric.size);
    },
  };
};

type IMetricsPerFile = IMetricsBlock<ITransformingMetricRecord>;

const bytesToKB = (bytes: number) => {
  const BYTES_PER_KB = 1024;
  return +(bytes / BYTES_PER_KB).toFixed(2) + ' kB';
};

const formatTime = (time: number) => {
  return `${time.toFixed(2)} ms`;
};

type IMetricOutput = {
  titleSize: string[];
  topic: string[];
  percent: string[];
  time: string[];
};

class FileMetricsPrinter extends MetricsPrinter {
  static readonly _SPLITTER = colorPalette.muted('│');

  private _colorizeFilePath(filePath: string, makeFileNamePrimary: boolean = false) {
    const absoluteDir = path.dirname(filePath);
    const relativeDir = path.relative(cwd(), absoluteDir) + path.sep;

    const fileName = path.basename(filePath);
    const colorizedFileName = makeFileNamePrimary ? colorPalette.primary(fileName) : colorPalette.common(fileName);

    return colorPalette.muted(relativeDir) + colorizedFileName;
  }

  // TODO Change "difference in percent" to a single name over all package
  private _colorizeDiffPercent(diff: string) {
    const numDiff = parseFloat(diff);
    const colorizeFn = (v: string) => {
      if (numDiff < 0) {
        return colorPalette.success(v);
      } else if (numDiff > 0) {
        return colorPalette.error('+' + v);
      } else {
        return colorPalette.muted(v);
      }
    };

    return colorizeFn(diff);
  }

  private _getBulletByLast(isMain: boolean, last: boolean) {
    if (isMain) {
      return '';
    }
    return last ? MetricsPrinter.BULLETS[0] : MetricsPrinter.BULLETS[1];
  }

  private _prepareMetrics(metricsPerFiles: IMetricsPerFile[]): IMetricOutput[] {
    const outputs: IMetricOutput[] = structuredClone(metricsPerFiles)
      .flat()
      .map((metricsPerFile, inx, arr) => ({
        titleSize: [
          this._getBulletByLast(metricsPerFile.isMain, inx === arr.length - 1 || arr[inx + 1].isMain),
          metricsPerFile.title,
          bytesToKB(metricsPerFile.size),
        ],
        topic: [metricsPerFile.isMain ? '' : metricsPerFile.topic],
        time: [metricsPerFile.isMain ? '' : formatTime(metricsPerFile.time)],
        percent: [metricsPerFile.isMain ? '' : `${metricsPerFile.diff}`],
      }));

    normilizeLength(outputs, 'titleSize', ([prefix, title, size], mod) => [prefix, title, mod, size]);

    normilizeLength(outputs, 'topic', ([topic], mod) => (topic === '' ? ['', ''] : [topic, mod]), 0);

    normilizeLength(outputs, 'percent', ([percent], mod) => (percent === '' ? ['', ''] : [percent, mod]), 0);

    return outputs;
  }

  private _printOutput(output: IMetricOutput) {
    const [prefix, filePath, titleIndent, size] = output.titleSize;
    const [time] = output.time;
    const [topic, topicIndent] = output.topic;
    const [percent, percentIndent] = output.percent;

    const main = !topic;
    const splitterIfValue = (v: string) => (v ? FileMetricsPrinter._SPLITTER : '');
    const colorizedSize = main ? colorPalette.common(size) : colorPalette.muted(size);
    console.log(
      colorPalette.muted(prefix) + this._colorizeFilePath(filePath, !!prefix) + titleIndent + colorizedSize,
      FileMetricsPrinter._SPLITTER,
      colorPalette.common(topic) + topicIndent,
      splitterIfValue(topic),
      this._colorizeDiffPercent(percent) + percentIndent,
      splitterIfValue(percent),
      colorPalette.muted(time)
    );
  }

  printBlocks(metricsPerFiles: IMetricsPerFile[]) {
    const metricOutputs = this._prepareMetrics(metricsPerFiles);

    for (const output of metricOutputs) {
      this._printOutput(output);
    }
  }

  printMetricPerTopic(...[topic, metricPerTopic]: Parameters<InstanceType<typeof MetricsPrinter>['printMetricPerTopic']>) {
    const output = [
      ['Original size:', bytesToKB(metricPerTopic.mainSize)],
      ['Result size:', bytesToKB(metricPerTopic.proccessedSize)],
      ['Files quantity:', `${metricPerTopic.metricsQnt}`],
      ['Proccessing time:', formatTime(metricPerTopic.totalTime)],
      ['Size diff in percent:', metricPerTopic.diffInPercent],
    ].map((v) => ({ output: v }));

    normilizeLength(output, 'output', ([label, value], mod) => [label, mod, value], 2);

    const logWithBullet = (last: boolean, ...args: string[]) => console.log(colorPalette.muted(this._getBulletByLast(false, last)) + args[0], ...args.slice(1));
    console.log('');
    console.log(colorPalette.common('Transfomation:'), colorPalette.primary(topic));
    logWithBullet(false, colorPalette.muted(output[0].output[0]), output[0].output[1], colorPalette.muted(output[0].output[2]));
    logWithBullet(false, colorPalette.common(output[1].output[0]), output[1].output[1], colorPalette.common(output[1].output[2]));
    logWithBullet(false, colorPalette.common(output[4].output[0]), output[4].output[1], this._colorizeDiffPercent(output[4].output[2]));
    logWithBullet(false, colorPalette.muted(output[2].output[0]), output[2].output[1], colorPalette.muted(output[2].output[2]));
    logWithBullet(true, colorPalette.muted(output[3].output[0]), output[3].output[1], colorPalette.muted(output[3].output[2]));
  }
}

/** @description This class is an descendant of "ProductivityMetrics".
 *
 * It implements logic to handle "File" and "TransformedFile" types, it extracts
 * needed data from type's objects and creates ready to use Metric-type's object
 */
export class FileTransformationMetrics extends ProductivityMertrics {
  private readonly _metricsPerFiles: IMetricsPerFile[] = [];
  constructor() {
    super();
    this._printer = new FileMetricsPrinter();
  }

  /** @description records needed information about file proccessing */
  record(file: IFile<Buffer>, transformedFiles: ITransformedFile<Uint8Array>[]) {
    const originalFileMetric = metricToTransformingMetric(file.content.byteLength, {
      size: file.content.byteLength,
      title: file.path,
      isMain: true,
      time: null,
      topic: null,
    });

    const transformedFilesMetrics = transformedFiles.map((file) =>
      metricToTransformingMetric(originalFileMetric.size, {
        size: file.content.byteLength,
        time: file.processingTime,
        title: file.path,
        topic: file.transformationName,
        isMain: false,
      })
    );

    this._recordPerTopicMetrics(originalFileMetric, transformedFilesMetrics);
    transformedFilesMetrics.unshift(originalFileMetric);

    this._metricsPerFiles.push(transformedFilesMetrics);
  }

  print() {
    console.log(`${chalk.bold.yellow('⚡')}${colorPalette.success('vite-plugin-files-transformer')}`, colorPalette.common('proccessed these files'));
    this._printer.printBlocks(this._metricsPerFiles);
  }

  printTopicsSummary() {
    const metricsPerTopics = [...this._metrics.entries()];

    metricsPerTopics.forEach(([topic, metric]) => {
      this._printer.printMetricPerTopic(topic, metric);
    });

    this._printer.printMetricPerTopic('total', {
      mainSize: metricsPerTopics.reduce((acc, [, metric]) => acc + metric.mainSize, 0) / metricsPerTopics.length,
      proccessedSize: metricsPerTopics.reduce((acc, [, metric]) => acc + metric.proccessedSize, 0),
      get diffInPercent() {
        const avg = metricsPerTopics.reduce((acc, [, metric]) => acc + parseFloat(metric.diffInPercent), 0) / metricsPerTopics.length;
        return avg.toFixed(2) + ' %';
      },
      totalTime: metricsPerTopics.reduce((acc, [, metric]) => acc + metric.totalTime, 0),
      metricsQnt: metricsPerTopics.reduce((acc, [, metric]) => acc + metric.metricsQnt, 0),
    });

    console.log('');
  }
}
