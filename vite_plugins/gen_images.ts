import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import type { ITransform } from './types';
import { proccessFiles } from './core/proccessFiles';
import { toWebp, toLowQuality } from './defaultTransforms';

const transforms: ITransform[] = [toWebp, toLowQuality];

const argv = yargs(hideBin(process.argv))
  .option('patterns', {
    alias: 'p',
    type: 'string',
    description: 'Files search pattern',
    demandOption: true,
  })
  .help()
  .alias('help', 'h').argv;

// TODO need to think how to prodive transforms using CLI. Probably it will be better to expose original fn to give user an ability to create own scripts.
proccessFiles({
  patterns: argv['patterns'].split(';'),
  transforms: transforms,
  ignores: argv['ignores']?.split(';') ?? [],
});
