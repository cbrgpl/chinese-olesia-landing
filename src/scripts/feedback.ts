// const fetchFeedbacks = (): Promise<IFeedback[]> => {};
// import { vkCachedFeedbacks } from '@/static/vkCachedFeedbacks';
// import { avitoCachedFeedbacks } from '@/static/avitoCachedFeedbacks';

import Swiper from 'swiper';
import { Navigation, Pagination, Virtual } from 'swiper/modules';

import { Modal } from '@/libs/modal';

import type { IFeedback } from '@/static/feedbackUtils';
import { EFeedbackOrigins } from '@/static/feedbackUtils';
import { CardBuildingContext, loadCache, type IModalManipulators } from './feedbackCardBuilding';
import { shuffleArr } from '@/utils/shuffleArr';

Swiper.use([Navigation, Pagination, Virtual]);

const initSlider = (feedbacks: IFeedback[], cardBuildingContext: CardBuildingContext) => {
  new Swiper('#feedback-slider', {
    slidesPerView: 1,
    spaceBetween: 20,

    pagination: {
      el: '.swiper-pagination',
      type: 'fraction',
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    virtual: {
      enabled: true,
      slides: feedbacks,
      addSlidesAfter: 1,
      renderSlide: (feedback: IFeedback) => {
        cardBuildingContext.setStrategy(feedback.origin);
        const $card = cardBuildingContext.build(feedback);
        $card.classList.add('swiper-slide');
        return $card;
      },
    },

    breakpoints: {
      720: {
        slidesPerView: 2,
        spaceBetween: 20,

        virtual: {
          addSlidesAfter: 2,
        },
      },
      1200: {
        slidesPerView: 3,
        spaceBetween: 50,

        virtual: {
          addSlidesAfter: 3,
        },
      },
    },
  });
};
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

const getFeedbacks = async () => {
  const { feedbacks: feedbacksAvito } = await loadCache(EFeedbackOrigins.AVITO);
  const { feedbacks: feedbacksVk } = await loadCache(EFeedbackOrigins.VK);

  const feedbacks = [...feedbacksAvito, ...feedbacksVk];
  shuffleArr(feedbacks);
  return feedbacks;
};

(() => {
  requestIdleCallback(async () => {
    const modalManipulators = initModal();
    const feedbacks = await getFeedbacks();
    const cardBuildingContext = new CardBuildingContext(modalManipulators);
    initSlider(feedbacks, cardBuildingContext);
  });
})();
