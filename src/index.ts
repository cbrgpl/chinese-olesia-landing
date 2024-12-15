import 'requestidlecallback-polyfill';
import './styles/initial.scss';
import './scripts/personal.ts';

import { allowImagesLoading } from './components/image/image';

const addVersionLine = () => {
  const VERSION = '0.01';
  const $div = document.createElement('div');
  $div.style.background = 'red';
  $div.innerText = `Версия ${VERSION}`;
  $div.style.position = 'absolute';
  $div.style.top = '0';
  $div.style.left = '0';
  $div.style.width = '100vw';
  $div.style.color = '#fff';
  $div.style.fontFamily = 'monospace';
  $div.style.fontWeight = '600';
  $div.style.textAlign = 'center';
  $div.style.zIndex = '999999';
  document.body.append($div);
};

if (import.meta.env.DEV) {
  addVersionLine();
}

const hidePreloader = () => {
  setTimeout(() => {
    const $preloader = document.querySelector('.preloader') as HTMLElement | null;

    if (!$preloader) {
      return;
    }

    $preloader.classList.add('preloader--hidden');
    $preloader.addEventListener('transitionend', () => {
      $preloader.style.display = 'none';
    });
  }, 150);
};

window.addEventListener('load', async () => {
  await import('./styles/index.scss' as any);
  allowImagesLoading();
  import('./scripts/universities');
  import('./scripts/feedback');
  hidePreloader();
});
