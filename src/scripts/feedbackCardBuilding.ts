import { EFeedbackOrigins, type IFeedback } from '@/static/feedbackUtils';
import { formatDate } from '@/utils/formatDate';

type IModuleWithCache = { feedbacks: IFeedback[] };
import { createScoreStars } from '@/utils/createStars';

export interface IModalManipulators {
  show(feedback: IFeedback): void;
}

const domParserWrapper = new (class {
  private _parser: InstanceType<typeof DOMParser> | null = null;
  get parser() {
    if (!this._parser) {
      this._parser = new DOMParser();
    }

    return this._parser;
  }
})();
const cardBaseTemplate = `
<div class="feedback__card">
  <div class="feedback__card-header">
    <img class="feedback__avatar feedback__card-avatar" src="IFeedback.avatar" alt="Аватарка IFeedback.name" />
    <div class="feedback__card-title-wrapper">
      <div class="feedback__card-title">IFeedback.name</div>
    </div>
    <img class="feedback__card-type-icon" src="IFeedback.origin" alt="IFeedback.origin" title="IFeedback.origin" />
  </div>
  <div class="feedback__card-body">IFeedback.text</div>
  <div class="feedback__card-footer">
    <span class="feedback__card-date">IFeedback.date</span>
    <div class="feedback__gradient-wrapper">
      <button class="feedback__view-btn">Просмотреть</button>
    </div>
  </div>
</div>
`;

const getCardEl = <T extends HTMLElement = HTMLElement>($root: HTMLElement, selector: string) => {
  const $el = $root.querySelector(selector);

  if (!$el) {
    throw new Error("Cannot find card's $element for selector", {
      cause: { selector },
    });
  }

  return $el as T;
};

interface IExtrasStrategy {
  modifyCard(feedback: IFeedback, $card: HTMLElement): void;
  getTypeIcon(): string;
  getAltForTypeIcon(): string;
  importCache(): Promise<IModuleWithCache>;
}

const extrasStrategyVk = new (class ExtrasStrategyVk implements IExtrasStrategy {
  importCache(): Promise<IModuleWithCache> {
    return import('@/static/vkCachedFeedbacks');
  }

  getTypeIcon() {
    return '/vk_icon.svg';
  }

  getAltForTypeIcon(): string {
    return 'Из вк';
  }

  modifyCard(feedback: IFeedback, $card: HTMLElement): void {
    assertExtra(feedback.extras.vkExtras);

    const $likes = document.createElement('div');
    $likes.innerHTML = `<span>${feedback.extras.vkExtras.likes}</span>
<img class="feedback__card-vk-likes" src="/vk-like.svg" alt="лайков" width="16" height="16" />`;

    const $cardTitleWrapper = getCardEl($card, '.feedback__card-title-wrapper');
    $cardTitleWrapper.append($likes);
  }
})();

const assertExtra: (extra: Record<string, any> | null) => asserts extra is NonNullable<typeof extra> = (extra: Record<string, any> | null) => {
  if (!extra) {
    throw new Error('No extra when it is expected', {
      cause: {
        extra,
      },
    });
  }
};

const extrasStrategyAvito = new (class ExtrasStrategyAvito implements IExtrasStrategy {
  importCache(): Promise<IModuleWithCache> {
    return import('@/static/avitoCachedFeedbacks');
  }

  getTypeIcon() {
    return '/avito_icon.svg';
  }

  getAltForTypeIcon(): string {
    return 'Из авито';
  }

  modifyCard(feedback: IFeedback, $card: HTMLElement): void {
    const $score = createScoreStars((inx) => {
      assertExtra(feedback.extras.avitoExtras);
      return inx + 1 <= feedback.extras.avitoExtras.score;
    });

    const $cardTitleWrapper = getCardEl($card, '.feedback__card-title-wrapper');
    $cardTitleWrapper.append($score);
  }
})();

const getStrategy = (origin: EFeedbackOrigins) => {
  switch (origin) {
    case EFeedbackOrigins.AVITO:
      return extrasStrategyAvito;
    case EFeedbackOrigins.VK:
      return extrasStrategyVk;
    default:
      throw new Error("Unexpected origin while setting extra's strategy", {
        cause: {
          origin,
        },
      });
  }
};
export const loadCache = (origin: EFeedbackOrigins) => {
  const strategy: IExtrasStrategy = getStrategy(origin);
  return strategy.importCache();
};
export class CardBuildingContext {
  private _extrasStrategy: IExtrasStrategy | null = null;
  private readonly _modalManipulators: IModalManipulators;

  constructor(modalManipulators: IModalManipulators) {
    this._modalManipulators = modalManipulators;
  }

  private _strategyNotNull(strategy: IExtrasStrategy | null): asserts strategy {
    if (!strategy) {
      throw new Error('No extras strategy setted before build started', {
        cause: {
          _extrasStrategy: this._extrasStrategy,
        },
      });
    }
  }

  private _buildBaseCard(feedback: IFeedback) {
    this._strategyNotNull(this._extrasStrategy);

    const $card = domParserWrapper.parser.parseFromString(cardBaseTemplate, 'text/html').body.children[0] as HTMLElement | null;

    if (!$card) {
      throw new Error('No $card found in parsed template', {
        cause: {
          cardBaseTemplate,
        },
      });
    }

    const $avatar = getCardEl<HTMLImageElement>($card, '.feedback__card-avatar');
    $avatar.src = feedback.avatar ?? 'feedback_avatar_placeholder.gen.webp';
    $avatar.alt = `Аватарка ${feedback.name}`;

    const $title = getCardEl($card, '.feedback__card-title');
    $title.innerText = feedback.name;

    const $typeIcon = getCardEl<HTMLImageElement>($card, '.feedback__card-type-icon');
    $typeIcon.src = this._extrasStrategy.getTypeIcon();
    $typeIcon.alt = this._extrasStrategy.getAltForTypeIcon();

    const $body = getCardEl($card, '.feedback__card-body');
    $body.innerText = feedback.text;

    const $date = getCardEl($card, '.feedback__card-date');
    $date.innerText = formatDate(feedback.date, 'datetime');

    const $viewBtn = getCardEl($card, '.feedback__view-btn');
    $viewBtn.addEventListener('click', () => {
      // TODO Написать реализацию
      this._modalManipulators.show(feedback);
    });

    return $card;
  }

  build(feedback: IFeedback) {
    this._strategyNotNull(this._extrasStrategy);
    const $card = this._buildBaseCard(feedback);
    this._extrasStrategy.modifyCard(feedback, $card);
    this._extrasStrategy = null;
    return $card;
  }

  setStrategy(origin: EFeedbackOrigins) {
    this._extrasStrategy = getStrategy(origin);
  }
}
