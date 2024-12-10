// const fetchFeedbacks = (): Promise<IFeedback[]> => {};
// import { vkCachedFeedbacks } from '@/static/vkCachedFeedbacks';
// import { avitoCachedFeedbacks } from '@/static/avitoCachedFeedbacks';

import { Modal } from '@/libs/modal';

import type { IFeedback } from '@/static/feedbackUtils';
import { EFeedbackOrigins } from '@/static/feedbackUtils';
import { CardBuildingContext, loadCache, type IModalManipulators } from './feedbackCardBuilding';
import { shuffleArr } from '@/utils/shuffleArr';

const initModal = (): IModalManipulators => {
  const modal = new Modal('#feedback-modal');

  return {
    show(feedback: IFeedback) {
      const $image = modal.$mask.querySelector('.feedback-modal__avatar') as HTMLImageElement;
      $image.setAttribute('src', feedback.avatar ?? '/feedback_avatar_placeholder.webp');

      $image.setAttribute('alt', `Аватарка ${feedback.name}`);

      const $content = modal.$mask.querySelector('.modal__content') as HTMLElement;
      $content.innerText = feedback.text;

      const $name = modal.$mask.querySelector('.feedback-modal__name') as HTMLElement;
      $name.innerText = feedback.name;

      modal.show();
    },
  };
};
const appendCards = async (modalManipulators: IModalManipulators) => {
  const { feedbacks: feedbacksAvito } = await loadCache(EFeedbackOrigins.AVITO);
  const { feedbacks: feedbacksVk } = await loadCache(EFeedbackOrigins.VK);

  const cardBuildingContext = new CardBuildingContext(modalManipulators);

  const $cards: HTMLElement[] = [];

  for (const feedback of [...feedbacksAvito, ...feedbacksVk]) {
    cardBuildingContext.setStrategy(feedback.origin);
    const $card = cardBuildingContext.build(feedback);
    $cards.push($card);
  }

  shuffleArr($cards);
  document.querySelector('.feedback__cards')?.append(...$cards);
};
(async () => {
  const modalManipulators = initModal();
  appendCards(modalManipulators);
})();
