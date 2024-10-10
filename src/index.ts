import './styles/initial.scss';
import './styles/index.scss';

// eslint-disable-next-line no-console
console.log('hello world');

window.addEventListener('load', () => {
  import('./scripts/personal.ts');
  import('./scripts/universities.ts');
});
