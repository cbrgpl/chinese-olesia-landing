import { waitForTransitionend } from '../../utils/waitForTransitionend';
import { recalcElementDom } from '@/utils/recalcDom';

const getElOrThrowErr = ($el: HTMLElement | string, $root: HTMLElement = document.body) => {
  if (typeof $el === 'string') {
    const $foundEl = $root.querySelector($el) as HTMLElement;
    if (!$foundEl) {
      throw new Error(`Could not find an element for given selectror "${$el}"`);
    }
    return $foundEl;
  } else {
    return $el;
  }
};

const el1IsEl2OrChild = (el1: HTMLElement, el2: HTMLElement) => {
  if (el1 === el2) {
    return true;
  }

  let iterEl = el1;
  while (iterEl.parentElement !== null) {
    if (iterEl.parentElement === el2) {
      return true;
    }
    iterEl = iterEl.parentElement;
  }

  return false;
};

enum EProcedureStatus {
  ABORT = 'abort',
  COMPLETE = 'complete',
}

type IClosingEl = {
  $el: HTMLElement;
  exact: boolean;
};
export class Modal {
  readonly $mask: HTMLElement;
  private readonly _$window: HTMLElement;
  private readonly _visible: boolean;

  private _hideLastAnimationProcedure: null | (() => void) = null;

  constructor($mask: HTMLElement | string) {
    this.$mask = getElOrThrowErr($mask);

    if (this.$mask.dataset['data-modal-inited'] === '') {
      throw new Error('Modal instance already have been initialized');
    } else {
      this.$mask.setAttribute('data-modal-inited', '');
    }

    this._$window = this.$mask.children[0] as HTMLElement;

    this._addOnCloseListeners([
      { $el: this.$mask, exact: true },
      { $el: getElOrThrowErr('.modal__close-btn', this.$mask), exact: false },
    ]);
  }

  get visible() {
    return this._visible;
  }

  private _addOnCloseListeners($els: IClosingEl[]) {
    for (const { $el, exact } of $els) {
      $el.addEventListener('click', (e) => {
        const shouldCallHide = exact ? e.target === $el : el1IsEl2OrChild(e.target as HTMLElement, $el);

        if (shouldCallHide) {
          this.hide();
        }
      });
    }
  }

  private _initAnimationProcedure() {
    const procedure = { aborted: false };

    this._hideLastAnimationProcedure = () => {
      procedure.aborted = true;
    };

    return procedure;
  }

  async hide() {
    if (this._$window.classList.contains('modal__window--hidden')) {
      return;
    }

    if (this._hideLastAnimationProcedure) {
      this._hideLastAnimationProcedure();
    }

    const procedure = this._initAnimationProcedure();

    await waitForTransitionend(this._$window, ($window) => {
      $window.classList.add('modal__window--hidden');
    });

    if (procedure.aborted) {
      return EProcedureStatus.ABORT;
    }

    console.log(this.$mask);
    await waitForTransitionend(this.$mask, ($mask) => {
      $mask.classList.add('modal--hidden');
    });

    if (procedure.aborted) {
      return EProcedureStatus.ABORT;
    }

    recalcElementDom(this.$mask);
    this.$mask.style.display = 'none';

    return EProcedureStatus.COMPLETE;
  }

  async show(): Promise<EProcedureStatus> {
    if (this._hideLastAnimationProcedure) {
      this._hideLastAnimationProcedure();
    }

    const procedure = this._initAnimationProcedure();

    this.$mask.style.display = 'flex';
    recalcElementDom(this.$mask);

    await waitForTransitionend(this.$mask, ($mask) => {
      $mask.classList.remove('modal--hidden');
    });

    if (procedure.aborted) {
      return EProcedureStatus.ABORT;
    }

    await waitForTransitionend(this._$window, ($window) => {
      $window.classList.remove('modal__window--hidden');
    });

    if (procedure.aborted) {
      return EProcedureStatus.ABORT;
    }

    return EProcedureStatus.COMPLETE;
  }
}
