import './styles/initial.scss';
import './scripts/personal.ts'

import { allowImagesLoading } from './components/image/image.ts'

// 1. Интегрировать CImage с ObservationAPI
// 2. Интегрировать нормальное сжатие и блюринг для картинок
// 3. Придумать как еще можно грузить картинки кроме load-ивента
// 4. Сделать, чтобы webp картинки тоже подгружались

window.addEventListener('load', async () => {
  /** @ts-ignore */
  await import('./styles/index.scss');
  allowImagesLoading()
  import('./scripts/universities.ts');
});
