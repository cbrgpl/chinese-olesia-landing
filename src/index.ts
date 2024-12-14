import './styles/initial.scss';
import './scripts/personal.ts';

import { allowImagesLoading } from './components/image/image';

// 3. Придумать как еще можно грузить картинки кроме load-ивента
// 4. Сделать, чтобы webp картинки тоже подгружались
if (!window.requestIdleCallback) {
  // TODO Add normal polyfill
  window.requestIdleCallback = ((cb: (...args: any) => any) => {
    setTimeout(() => {
      cb();
    }, 200);
  }) as any;
}

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

window.addEventListener('load', async () => {
  await import('./styles/index.scss' as any);
  allowImagesLoading();
  import('./scripts/universities');
  import('./scripts/feedback');
});
