import { type IFeedback, EFeedbackOrigins } from '@/static/feedbackUtils';

export const feedbacks: IFeedback[] = [
  {
    avatar: 'https://70.img.avito.st/image/1/1.Q8jbFba1-SHtsm0n0QRJ2vK07SFlvm0n7bLtIw.gOKMY79PXOB2DRTQmEkNePbBJRy3XCh8O31MRcr6g_k',
    name: 'Катя',
    date: '2022-07-24T00:00',
    text: 'Первый урок прошёл на высшем уровне. Где были неясности Олеся сразу же остановилась и помогла разъяснить все. Так же отдельно хочется сказать про формат урока - приятная глазу презентация, ничего лишнего и мешающего усвоению материала. Было крайне интересно смотреть. Очень креативный подход !',
    origin: EFeedbackOrigins.AVITO,
    extras: {
      vkExtras: null,
      avitoExtras: {
        score: 5,
      },
    },
  },
  {
    avatar: 'https://70.img.avito.st/image/1/1.VBXm97a27vzQUHr6wvJPYg5U-PZY1P5-VFT6.IRdaT9VaWdg-pZbE-AfkGi6Pq8HaDR7ajWpTawtW4Fo',
    name: 'Евгения',
    date: '2022-06-11T00:00',
    text: 'Отличный репетитор! Материал преподносится очень доступно и легко!',
    origin: EFeedbackOrigins.AVITO,
    extras: {
      vkExtras: null,
      avitoExtras: {
        score: 5,
      },
    },
  },
  {
    avatar: null,
    name: 'Майя',
    date: '2022-04-18T00:00',
    text: 'Олеся быстро ответила а запрос, провела первое ознакомительное занятие. Нам все понравилось.',
    origin: EFeedbackOrigins.AVITO,
    extras: {
      vkExtras: null,
      avitoExtras: {
        score: 5,
      },
    },
  },
];
