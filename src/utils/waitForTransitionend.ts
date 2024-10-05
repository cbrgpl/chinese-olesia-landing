export const waitForTransitionend = ( $el: HTMLElement, mutateElCb: ( $el: HTMLElement) => void) => {
  let resolvePromise: null | ((v: null) => void) = null;

  const promise = new Promise((res) => {
    resolvePromise = res;
  });

  $el.addEventListener("transitionend", (e) => {
    if (e.target !== $el) {
      return;
    }

    if (resolvePromise) {
      resolvePromise(null);
    }
  });

  mutateElCb( $el )

  return promise;
};
