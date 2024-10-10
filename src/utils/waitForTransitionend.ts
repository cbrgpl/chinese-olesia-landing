export const waitForTransitionend = ( $el: HTMLElement, mutateElCb: ( $el: HTMLElement) => void) => {
  let resolvePromise: null | ((v: null) => void) = null;

  const promise = new Promise((res) => {
    resolvePromise = res;
  });

  const handler = (e) => {
    console.log(e.target)

    if (e.target !== $el) {
      return;
    }

    if (resolvePromise) {
      resolvePromise(null);
      $el.removeEventListener('transitionend', handler)
    }
  }
  $el.addEventListener("transitionend", handler);

  mutateElCb( $el )

  return promise;
};
