export const getDiffInPercent = (mainSize: number, finalSize: number) => {
  if (mainSize === 0) {
    return '0.00 %';
  }

  const percentOfDiff = ((finalSize - mainSize) / mainSize) * 100;
  return percentOfDiff.toFixed(2) + ' %';
};
