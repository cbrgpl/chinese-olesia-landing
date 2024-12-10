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

abstract class ExtrasStrategy {
  protected readonly _loadCache: () => Promise<IModuleWithCache>;

  constructor(loadCache: () => Promise<IModuleWithCache>) {
    this._loadCache = loadCache;
  }

  abstract modifyCard(feedback: IFeedback, $card: HTMLElement): void;
  abstract getTypeIcon(): string;
  abstract getAltForTypeIcon(): string;
  abstract fetchFeedbacks(): Promise<IFeedback[] | null>;

  async importCache(): Promise<IFeedback[]> {
    try {
      const module: IModuleWithCache = await this._loadCache();
      return module.feedbacks;
    } catch (err) {
      console.group('Some error happend when try to import cached feedbacks');
      console.error(err);
      console.groupEnd();

      return [];
    }
  }

  protected async _fetchFeedbacksDecorator(fetchIt: () => Promise<IFeedback[]>) {
    try {
      return await fetchIt();
    } catch (err) {
      console.groupCollapsed('An error happend when tried to fetch avito feedbacks');
      console.error(err);
      console.groupEnd();

      return this.importCache();
    }
  }
}

const extrasStrategyVk = new (class ExtrasStrategyVk extends ExtrasStrategy {
  constructor() {
    super(() => import('@/static/vkCachedFeedbacks'));
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

  fetchFeedbacks() {
    return this._fetchFeedbacksDecorator(async () => {
      throw new Error('Not able to fetch feedbacks from VK...');
    });
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

type IAvitoApiFeedback = {
  type: string;
  value: {
    title: string;
    avatar: string;
    rated: string;
    itemTitle: string;
    stageTitle: string;
    textSections: Array<{ text: string }>;
    id: number;
    score: number;
  };
};
const extrasStrategyAvito = new (class ExtrasStrategyAvito extends ExtrasStrategy {
  private readonly _LOCAL_STORAGE_NAMES = {
    FEEDBACKS: 'AVITO_FEEDBACKS',
    TIME_OF_SETTING: 'AVITO_TIME_OF_SETTING',
  };

  private readonly _AVITO_STORAGE_LIFESPAN = 1 * 1000 * 60 * 60 * 24;

  constructor() {
    super(() => import('@/static/avitoCachedFeedbacks'));
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

  async fetchFeedbacks() {
    return this._fetchFeedbacksDecorator(async () => {
      const storageCache = this._getLocalStorageCache();
      if (storageCache !== null) {
        const { timeOfSetting, feedbacks } = storageCache;

        if (Date.now() - timeOfSetting >= this._AVITO_STORAGE_LIFESPAN) {
          this._clearLocalStorageCache();
        } else {
          return Promise.resolve(feedbacks);
        }
      }

      const response = await fetch('https://www.avito.ru/web/6/user/14ae88a1d924c65dbfa45fc3ebc181d1/ratings', {
        mode: 'no-cors',
      });

      if (response.status !== 200) {
        throw new Error('Caught not successful status from AvitoAPI', {
          cause: {
            status: response.status,
          },
        });
      }

      const body: { entries: IAvitoApiFeedback[] } = await response.json();
      const feedbacks = body.entries.filter((feedback) => feedback.type === 'rating').map((feedback) => this._formatFeedback(feedback));

      this._saveLocalStorageCache(feedbacks);

      return feedbacks;
    });
  }

  private _formatFeedback(apiFeedback: IAvitoApiFeedback): IFeedback {
    return {
      avatar: apiFeedback.value.avatar,
      date: this._formatFromAvitoDate(apiFeedback.value.rated),
      name: apiFeedback.value.title,
      text: apiFeedback.value.textSections.reduce((text: string, paragraph, inx) => {
        return text + (inx === 0 ? '' : '\n') + paragraph.text;
      }, ''),
      origin: EFeedbackOrigins.AVITO,
      extras: {
        vkExtras: null,
        avitoExtras: {
          score: apiFeedback.value.score,
        },
      },
    };
  }

  /** @description avito's format is "26 июля 2024", this methods formats it to MM.DD.YYYY*/
  private _formatFromAvitoDate(date: string) {
    const [day, month, year] = date.split(' ');
    const MONTHS_IN_RUS: Record<string, any> = {
      января: '01',
      февраля: '02',
      марта: '03',
      апреля: '04',
      мая: '05',
      июня: '06',
      июля: '07',
      августа: '08',
      сентября: '09',
      октября: '10',
      ноября: '11',
      декабря: '12',
    };

    return `${MONTHS_IN_RUS[month!]}.${day}.${year}`;
  }

  private _clearLocalStorageCache() {
    localStorage.removeItem(this._LOCAL_STORAGE_NAMES.FEEDBACKS);
    localStorage.removeItem(this._LOCAL_STORAGE_NAMES.TIME_OF_SETTING);
  }

  private _getLocalStorageCache() {
    const timeOfSetting = localStorage.getItem(this._LOCAL_STORAGE_NAMES.TIME_OF_SETTING);
    const feedbacks = localStorage.getItem(this._LOCAL_STORAGE_NAMES.FEEDBACKS);

    if (timeOfSetting === null || feedbacks === null) {
      return null;
    }

    try {
      return {
        timeOfSetting: +timeOfSetting,
        feedbacks: JSON.parse(feedbacks) as IFeedback[],
      };
    } catch (err) {
      console.groupCollapsed('An error happend when tried to get cached avito feedbacks from local storage');
      console.error(err);
      console.groupEnd();

      this._clearLocalStorageCache();

      return null;
    }
  }

  private _saveLocalStorageCache(feedbacks: IFeedback[]) {
    localStorage.setItem(this._LOCAL_STORAGE_NAMES.FEEDBACKS, JSON.stringify(feedbacks));
    localStorage.setItem(this._LOCAL_STORAGE_NAMES.TIME_OF_SETTING, `${Date.now()}`);
  }
})();

export const fetchFeedbacks = async (): Promise<IFeedback[]> => {
  const promises = [extrasStrategyAvito.fetchFeedbacks(), extrasStrategyVk.fetchFeedbacks()];

  const results = await Promise.allSettled(promises);

  return results.reduce<IFeedback[]>((feedbacks, res) => {
    console.log(res);
    if (res.status === 'fulfilled') {
      feedbacks.push(...res.value);
    }

    return feedbacks;
  }, []);
};
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

export class CardBuildingContext {
  private _extrasStrategy: ExtrasStrategy | null = null;
  private readonly _modalManipulators: IModalManipulators;

  constructor(modalManipulators: IModalManipulators) {
    this._modalManipulators = modalManipulators;
  }

  private _strategyNotNull(strategy: ExtrasStrategy | null): asserts strategy {
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
    $title.setAttribute('title', feedback.name);

    const $typeIcon = getCardEl<HTMLImageElement>($card, '.feedback__card-type-icon');
    $typeIcon.src = this._extrasStrategy.getTypeIcon();
    $typeIcon.alt = this._extrasStrategy.getAltForTypeIcon();
    $typeIcon.setAttribute('title', $typeIcon.alt);

    const $body = getCardEl($card, '.feedback__card-body');
    $body.innerText = feedback.text;

    const $date = getCardEl($card, '.feedback__card-date');
    $date.innerText = formatDate(feedback.date, 'datetime');

    const $viewBtn = getCardEl($card, '.feedback__view-btn');
    $viewBtn.addEventListener('click', () => {
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
