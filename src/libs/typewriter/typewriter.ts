const CHAR_APPEARANCE_TIME = 60;
const DEFAULT_INSERTATION_TIME = 30;

export class TextsContainer<T> {
  private readonly _texts: T[];
  private _i: number = -1;

  constructor(texts: T[]) {
    this._texts = texts;
  }

  get i() {
    return this._i;
  }

  get next(): T {
    return this._texts.at(++this._i % this._texts.length)!;
  }

  get prev(): T {
    return this._texts.at(--this._i % this._texts.length)!;
  }

  at(inx: number) {
    const text = this._texts.at(inx);

    if (!text) {
      return;
    }

    this._i = inx;
    return text;
  }
}

type ITypeWriterTarget = {
  push(v: string, isLast: boolean): void;
  pop(): void;
  setValue(v: string): void;
  getValue(): string;
};
export class TypeWritterHtml implements ITypeWriterTarget {
  public $el: HTMLElement;
  private _$removedChar: HTMLElement | null = null;
  private _cachedText: string = '';

  constructor($el: HTMLElement) {
    this.$el = $el;
  }

  async push(v: string, isLast: boolean) {
    this._cachedText += v;
    const $span = document.createElement('span');

    $span.style.opacity = '0';
    $span.style.transition = `all ${CHAR_APPEARANCE_TIME}ms ease-in`;
    $span.innerText = v;
    this.$el.append($span);

    /** @description time which needs to be waited for well worked appear animation */
    const TIME_TO_WAIT_FOR_WELL_APPEARANCE = 35;
    setTimeout(() => {
      $span.style.opacity = '1';
    }, TIME_TO_WAIT_FOR_WELL_APPEARANCE);

    if (isLast) {
      let resolve: null | ((v: unknown) => void) = null;

      $span.addEventListener('transitionend', () => {
        resolve!(null);
      });

      return new Promise((resolvePromise) => {
        resolve = resolvePromise;
      });
    }
  }

  pop() {
    if (!this._cachedText) {
      this._cachedText = this.$el.innerText;
    }

    this._cachedText = this._cachedText.slice(0, -1);

    if (!this.$el.lastChild) {
      throw new Error('Attemption of removing char when $el have been already emptied');
    }

    const $newRemovedEl = (this._$removedChar ? this._$removedChar.previousSibling : this.$el.lastChild) as HTMLElement | null;

    if ($newRemovedEl) {
      $newRemovedEl.addEventListener('transitionend', () => {
        this.$el.removeChild($newRemovedEl);
      });
      $newRemovedEl.style.opacity = '0';
    }

    this._$removedChar = $newRemovedEl;
  }

  setValue(v: string) {
    this.$el.innerHTML = '';
    this.$el.append(
      ...v.split('').map((char) => {
        const $span = document.createElement('span');
        $span.style.transition = 'all 250ms ease-in';
        $span.innerText = char;
        return $span;
      })
    );
  }

  getValue() {
    return this._cachedText || this.$el.innerText;
  }
}

enum EWritingProcessResults {
  OK = 'OK',
  ABORT = 'ABORT',
}
type ITextMutationParams = {
  insertationTime?: number;
  timeAmplitude?: number;
  replaceAll?: boolean;
};
type ITextMutationIterationParams = {
  insertationTime: number;
  timeAmplitude: number;

  getNewAcc: (acc: string) => string;
  mutate: (target: ITypeWriterTarget, acc: string) => void | Promise<void>;
};
export class TypeWriter {
  private _target: ITypeWriterTarget;
  private _resolveWriting: null | ((value: EWritingProcessResults) => void) = null;

  constructor(target: ITypeWriterTarget) {
    this._target = target;
  }

  private _getClearMutationParams(params: ITextMutationParams): Required<ITextMutationParams> {
    return {
      replaceAll: params.replaceAll ?? false,
      insertationTime: params.insertationTime ?? DEFAULT_INSERTATION_TIME,
      timeAmplitude: params.timeAmplitude ?? 0,
    };
  }

  private _runTextMutationIteration(acc: string, params: ITextMutationIterationParams, promiseStatusContainer: { status: EWritingProcessResults | null }) {
    if (!this._resolveWriting) {
      throw new Error('Function "resolve" was not provided for resolving text mutation');
    }

    setTimeout(
      async () => {
        if (promiseStatusContainer.status === EWritingProcessResults.ABORT) {
          return;
        }

        await params.mutate(this._target, acc);

        if (acc.length === 1) {
          this._resolveWriting!(EWritingProcessResults.OK);
          return;
        }

        this._runTextMutationIteration(params.getNewAcc(acc), params, promiseStatusContainer);
      },
      params.insertationTime + Math.random() * params.timeAmplitude
    );
  }

  writeText(v: string, params: ITextMutationParams): Promise<EWritingProcessResults> {
    const promiseStatusContainer: { status: EWritingProcessResults | null } = {
      status: null,
    };
    const promise = new Promise<EWritingProcessResults>((resolve) => {
      this._resolveWriting = (v) => {
        promiseStatusContainer.status = v;
        resolve(v);
      };
    });

    const { replaceAll, insertationTime, timeAmplitude } = this._getClearMutationParams(params);

    if (replaceAll) {
      this._target.setValue(v);
    } else {
      this._runTextMutationIteration(
        v,
        {
          insertationTime,
          timeAmplitude,
          getNewAcc: (acc) => acc.slice(1),
          mutate: (target, acc) => {
            return target.push(acc.slice(0, 1), acc.length === 1);
          },
        },
        promiseStatusContainer
      );
    }

    return promise;
  }

  abortWriting() {
    if (this._resolveWriting) {
      this._resolveWriting(EWritingProcessResults.ABORT);
    }
  }

  removeText(params: ITextMutationParams) {
    const promiseStatusContainer: { status: EWritingProcessResults | null } = {
      status: null,
    };
    const promise = new Promise<EWritingProcessResults>((resolve) => {
      this._resolveWriting = (v) => {
        promiseStatusContainer.status = v;
        resolve(v);
      };
    });

    const { replaceAll, insertationTime, timeAmplitude } = this._getClearMutationParams(params);
    if (replaceAll) {
      this._target.setValue('');
    } else {
      this._runTextMutationIteration(
        this._target.getValue(),
        {
          insertationTime,
          timeAmplitude,
          getNewAcc: (acc) => acc.slice(0, -1),
          mutate: (target) => {
            target.pop();
          },
        },
        promiseStatusContainer
      );
    }

    return promise;
  }
}
