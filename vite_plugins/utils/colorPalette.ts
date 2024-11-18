import chalk from 'chalk'

export const colorPalette = {
  common: (v: string) => v ? chalk.hex('#272727')(v) : '',
  primary: (v: string) => v ? chalk.hex('#D42EE6')(v) : '',
  success: (v: string) => v ? chalk.hex('#55D545')(v) : '',
  error: (v: string) => v ? chalk.hex('#F64740')(v) : '',
  muted: (v: string) => v ?  chalk.dim(v) : '',
}
