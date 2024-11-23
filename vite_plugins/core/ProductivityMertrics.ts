import { getDiffInPercent } from '../utils/getDiffInPercent';

export type IMetricRecord = {
  size: number;
  title: string;
  isMain: boolean;
  time: number | null;
  topic: string | null;
};

export type IMetricsBlock<T extends IMetricRecord = IMetricRecord> = T[];

/** @description used for summary info about topic */
interface IMetricPerTopic {
  metricsQnt: number;
  mainSize: number;
  proccessedSize: number;
  totalTime: number;

  /** @description returns difference between mainSize and proccessedSize in percent.
   *
   * (original - proccessed) / original * 100% */
  get diffInPercent(): string;
}

type ITopicIn = {
  topic: string;
};

export abstract class MetricsPrinter {
  static readonly BULLETS = [' └─ ', ' ├─ '];
  abstract printBlocks(blocks: IMetricsBlock[]): void;
  abstract printMetricPerTopic(topic: string, metricPerTopic: IMetricPerTopic): void;
}

/** @description This class defines the contract for metrics and implements base logic for collecting metrics total[summary] and calling of print methods
 *
 * It also is the context for print strategy which is implemented using "protected _print" and IMetricsPrinter interface
 */
class ProductivityMertrics {
  protected readonly _metrics = new Map<string, IMetricPerTopic>();
  protected _printer: InstanceType<typeof MetricsPrinter> | null = null;

  addTopics(topics: ITopicIn[]) {
    for (const topic of topics) {
      if (!this._metrics.get(topic.topic)) {
        this._metrics.set(topic.topic, {
          mainSize: 0,
          proccessedSize: 0,
          metricsQnt: 0,
          totalTime: 0,

          get diffInPercent() {
            return getDiffInPercent(this.mainSize, this.proccessedSize);
          },
        });
      }
    }
  }

  protected _recordPerTopicMetrics(mainMetric: IMetricRecord, subMetrics: IMetricRecord[]) {
    subMetrics.forEach((metric) => {
      const topicMetric = this._metrics.get(metric.topic);

      if (!topicMetric) {
        console.warn(`No metric found per topic "${metric.topic}", cannot add current metric info to topic metric`);
        return;
      }

      topicMetric.proccessedSize += metric.size;
      topicMetric.mainSize += mainMetric.size;
      topicMetric.totalTime += metric.time;
      ++topicMetric.metricsQnt;
    });
  }
}

export { ProductivityMertrics };
