import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import '@styles/libs/swiper.scss';
import '@styles/sections/personal.scss';

import { TypeWriter, TypeWritterHtml, TextsContainer } from '../libs/typewriter';
import { waitForTransitionend } from '../utils/waitForTransitionend';

const titles = ['О моем 5-ти летнем опыте', 'Мои занятия - какие они?', 'Мое знакомство с китайским', 'Как я обучалась'];

const $biographyBlocks = [...document.querySelectorAll('.personal__biography-block')] as HTMLElement[];
const getBiographyPart = (what: 'title' | 'text', $biography: HTMLElement) => {
  let $el = null as HTMLElement | null;

  if (what === 'title') {
    $el = $biography.children[0] as HTMLElement;
  } else if (what === 'text') {
    $el = $biography.children[1] as HTMLElement;
  }

  if (!$el) {
    throw new Error(`No $el were found for ${what}`);
  }

  return $el;
};

const titlesContainer = new TextsContainer(titles);

const typeWritterHtml = new TypeWritterHtml(document.querySelector('.personal__title')!);
const titleWriter = new TypeWriter(typeWritterHtml);

const personalTypewriterControls = {
  onInit() {
    const title = titlesContainer.next;
    titleWriter.writeText(title, { replaceAll: true });
  },
  at: async (inx: number) => {
    const title = titlesContainer.at(inx);

    if (!title) {
      throw new Error(`No title for index "${inx}"`);
    }

    await titleWriter.writeText(title, {});
  },
};

Swiper.use([Navigation, Pagination]);

const resetBiographyBlock = ($block: HTMLElement) => {
  const $title = getBiographyPart('title', $block);
  const $text = getBiographyPart('text', $block);

  $text.classList.add('personal__text--hidden');
  $title.innerText = '';
};

let abortPreviousAnimation: null | (() => void) = null;
const showBiographyBlock = async (inx: number) => {
  if (abortPreviousAnimation) {
    abortPreviousAnimation();
  }

  const currentCallStatus = { aborted: false };
  abortPreviousAnimation = () => {
    currentCallStatus.aborted = true;
  };

  titleWriter.abortWriting();

  const $previousBiographyBlock = typeWritterHtml.$el.parentElement;
  const $currentBiographyBlock = $biographyBlocks[inx];

  if (!$currentBiographyBlock) {
    console.error(
      new Error('No $currentBiographyBlock found', {
        cause: {
          description: '$biographyBlocks[inx] is falsy',
        },
      })
    );
    return;
  }

  typeWritterHtml.$el = getBiographyPart('title', $currentBiographyBlock);
  resetBiographyBlock($currentBiographyBlock);

  if ($previousBiographyBlock) {
    if (!$previousBiographyBlock.classList.contains('personal__biography-block--hidden')) {
      await waitForTransitionend($previousBiographyBlock, ($previousBiographyBlock) => {
        $previousBiographyBlock.classList.add('personal__biography-block--hidden');
      });
    }

    $previousBiographyBlock.style.position = 'absolute';
  }

  if (currentCallStatus.aborted) {
    return;
  }

  $currentBiographyBlock.style.position = 'static';

  await waitForTransitionend($currentBiographyBlock, ($currentBiographyBlock) => {
    $currentBiographyBlock.classList.remove('personal__biography-block--hidden');
  });

  if (currentCallStatus.aborted) {
    return;
  }

  await personalTypewriterControls.at(inx);

  if (currentCallStatus.aborted) {
    return;
  }

  getBiographyPart('text', $currentBiographyBlock).classList.remove('personal__text--hidden');
};

const debounce = (params: { cb: (...args: any[]) => void; time: number }) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      params.cb(...args);
    }, params.time);
  };
};

requestIdleCallback(() => {
  const debouncedOnRealInxChange = debounce({
    cb: (realIndex: number) => {
      showBiographyBlock(realIndex);
    },
    time: 15,
  });

  new Swiper('.swiper ', {
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      bulletClass: 'swiper-pagination-bullet personal__pagination-bullet',
      bulletActiveClass: 'personal__pagination-bullet--active',
      clickable: true,
    },

    on: {
      init: () => {
        personalTypewriterControls.onInit();
      },
      realIndexChange: (swiper) => {
        if (titlesContainer.i === -1) {
          return;
        }

        if (titlesContainer.i !== swiper.realIndex) {
          debouncedOnRealInxChange(swiper.realIndex);
        }
      },
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
});

requestIdleCallback(() => {
  $biographyBlocks.forEach(($block) => {
    $block.style.opacity = null as any;
    $block.style.pointerEvents = null as any;
  });
});
