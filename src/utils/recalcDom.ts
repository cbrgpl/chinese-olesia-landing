export const recalcElementDom = ($el: HTMLElement) => {
  (() => $el.offsetWidth)();
};
