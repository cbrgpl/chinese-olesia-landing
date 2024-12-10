const getRand = (from: number, to: number) => from + Math.round(Math.random() * (to - from));
export const shuffleArr = <T>(arr: Array<T>): void => {
  const lastInx = arr.length - 1;
  for (let i = 0; i <= lastInx; ++i) {
    const randomBeforeI = getRand(0, i);
    const randomAfterI = getRand(i, lastInx);

    const tmp = arr[randomBeforeI];
    arr[randomBeforeI] = arr[randomAfterI]!;
    arr[randomAfterI] = tmp!;
  }
};
