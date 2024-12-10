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

window.addEventListener('load', async () => {
  await import('./styles/index.scss' as any);
  allowImagesLoading();
  import('./scripts/universities');
  import('./scripts/feedback');
});
