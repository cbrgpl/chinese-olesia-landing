export const max = <T>(values: T[], getter: (v: T) => number) => {
  let max = null as number | null;
  for (let i = 0; i < values.length; ++i) {
    const iNum = getter(values[i]);

    if (max === null) {
      max = iNum;
      continue;
    }

    max = iNum > max ? iNum : max;
  }

  return max;
};
/** @description makes strings fixed size, added whitespaces at the end
 *
 * @params
 *
 * **modifier** must apply modification by provided value parts and mod
 *
 * **extraLen** min. quantity of mod value
 */
export const normilizeLength = <T extends Record<string, string[]>>(
  values: T[],
  prop: keyof T,
  modifier: (valueParts: string[], mod: string) => string[],
  extraLen: number = 10
) => {
  const maxLen = max(values, (v) => v[prop].join('').length);
  const fixedSizeLen = maxLen + extraLen;

  values.forEach((v) => {
    const valueParts = v[prop];
    const valueLen = valueParts.join('').length;
    const mod = ' '.repeat(fixedSizeLen - valueLen);
    (v as any)[prop] = modifier(valueParts, mod);
  });
};
