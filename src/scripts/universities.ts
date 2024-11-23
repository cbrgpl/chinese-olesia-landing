import { Modal } from "../libs/modal";

type IUniversityInfo = {
  logo: string;
  lowQualityLogo: string;
  title: string;
  content: (() => HTMLElement)[];
}

type IParagraphOpts = {
  text: string;
  style?: string;
}
const createParagraph = ( opts: IParagraphOpts ) => {
  const $p = document.createElement('p')

  $p.setAttribute('style', opts?.style ?? '')
  $p.innerText = opts.text
  $p.classList.add('universities__modal-paragraph')

  return $p
}

type ICImgOpts = {
  sources: string;
  style?: string;
  lowQualitySrc?: string;
  class?: string;

  alt: string;

  width?: string;
  height?: string;
}
const createCImg = ( opts: ICImgOpts ) => {
  const $cImg = document.createElement('c-img')


  $cImg.setAttribute('alt', opts.alt)
  $cImg.setAttribute('width', opts?.width ?? 'auto' )
  $cImg.setAttribute('height', opts?.height ?? 'auto' )

  $cImg.setAttribute('sources', opts.sources)
  $cImg.setAttribute('style', opts?.style ?? '')
  $cImg.setAttribute('low-quality-src', opts?.lowQualitySrc ?? '')

  $cImg.setAttribute('class', opts?.class ?? '' )

  return $cImg
}

const modalContentMap = new Map<string, HTMLElement[]>()


type UUniversities = 'shandong' | 'unnan' | 'shanghai'
const universitiesInfo: Record<UUniversities, IUniversityInfo>  = {
  'shandong': {
    logo: 'university_shandong_logo.jpg;image/jpeg',
    lowQualityLogo: 'university_shandong_logo.low.gen.jpg',
    title: 'Shandong University of Technology',
    content: [
      () => createCImg({
        style: "float: right; height: 75vw; max-height: 380px",
        sources: "shandong_modal_1.jpg;image/jpeg",
        lowQualitySrc: "shandong_modal_1.low.gen.jpg",
        alt: 'Обучение игре на муз. инструменте'
      }),
      () => createParagraph({
        text: "Университет с дружелюбной атмосферой для иностранных студентов и не менее сильной языковой подготовкой."
      }),
      () => createParagraph({
        text: `Во время обучения был упор на изучение грамматики китайского языка, тренировки аудирования говорения, а также подготовке к экзамену HSK. Помимо
    основных предметов также посещала обучение каллиграфии и искусству игры на гучжэне ( традиционный китайский музыкальный инструмент).`
      }),
      () => createParagraph({
        style: 'margin-bottom: 0',
        text: `Языковой год был насыщен не только учебой, но и разными культурными мероприятиями, многие из них специально были организованы для иностранных студентов университета.`
      }),
      () => createCImg({
        sources: "shandong_modal_2.jpg;image/jpeg",
        alt: 'Я с друзьями',
        lowQualitySrc: 'shandong_modal_2.low.gen.jpg',
        style: 'float: left; max-width: 380px; margin-top: 1rem',
      }),
    ]
    ,
  },
  'unnan':{
    logo: '/university_unnan_logo.jpg;image/jpeg',
    lowQualityLogo: 'university_unnan_logo.low.gen.jpg',
    title: 'Unnan University',
    content: [
      () => createCImg({
        style: 'float: right; height: 70vw; max-height: 280px; margin-left: 5px',
        sources: 'unnan_modal_1.jpg;image/jpeg',
        class: 'universities__modal-img',
        lowQualitySrc: 'unnan_modal_1.low.gen.jpg',
        alt: 'Я и мой диплом бакалавра'
      }),
      () => createParagraph({
        text: `Один из десяти ключевых университетов страны, которые содействуют преподаванию китайского языка в соседних странах, под руководством
    Международного Совета по китайскому языку. Университет с сильной академической подготовкой и строгими правилами к студентам.`
      }),
      () => createParagraph({
        text: `Каждый семестр необходимо проходить дополнительные курсы помимо пар по специальности. Поэтому кроме экономических предметов и бизнес пар
    дополнительно изучила основы и особенности перевода, китайские традиционные орнаменты и т.д.`
      }),
      () => {
        const $div = document.createElement('div')
        $div.setAttribute('style', 'margin-top: 10px')

        $div.append(...[
          createCImg({
            style: 'float: left; height: 60vw; max-height: 280px; margin-right: 5px',
            sources: "unnan_modal_2.jpg;image/jpeg",
            class: 'universities__modal-img',
            lowQualitySrc: 'unnan_modal_2.low.gen.jpg',
            alt: 'Финальная защита научной работы'
          }),
          createParagraph({
            style: 'margin-bottom: 0',
            text: `За четыре года множество раз участвовала в совместных проектах с китайскими студентами, была лидером группы маркетинговых исследований.
    Занималась подготовкой, анализом и реализацией академического проекта по пограничной торговле между Россией и Китаем.`
          }),
          createCImg({
            style: "max-width: 380px; display: flex; margin: auto;",
            lowQualitySrc: 'unnan_modal_3.low.gen.jpg',
            class: 'universities__modal-img',
            sources: "unnan_modal_3.jpg;image/jpeg",
            alt: 'Один из этапов защиты научной работы'
          })
        ])

        return $div
      }
    ],
  },
  'shanghai':{
    logo: 'university_shanghai_logo.jpg;image/jpeg',
    lowQualityLogo: 'university_shanghai_logo.low.gen.jpg',
    title: 'Shanghai University of Finance and Econimics',
    content:  [
      () => createParagraph({
        text: `Благодаря весомой академической репутации университет занимает 3 место по Китаю и 120 по миру. Преподаватели лояльны и дружелюбны к иностранным
    студентам, можно отметить отличного уровня организацию мероприятий и процесса обучения.`
      }),
      () => createCImg({
        style: 'float: right; height: 70vw; max-height: 380px; margin-left: 5px',
        sources: 'shanghai_modal_1.jpg;image/jpeg',
        lowQualitySrc: 'shanghai_modal_1.low.gen.jpg',
        alt: 'Мой урок по бизнес китайскому'
      }),
      () => createParagraph({
        text: `Помимо бизнес китайского посещала курс по улучшению навыков письма на китайском языке, культуре деловых переговорах, освоила необходимую лексику
    в бизнес сфере. Принимала участие в конференции для предпринимателей, где применила полученные знания в устном и письменном переводе.`
      }),
      () => createCImg({
        style: 'max-width: 400px',
        sources: 'shanghai_modal_2.jpg;image/jpeg',
        lowQualitySrc: 'shanghai_modal_2.low.gen.jpg',
        alt: 'Я на церемонии поступления'
      }),
      () => createParagraph({
        text: `Университет помогал понять культуру Китая, периодически устраивал собрания для иностранных студентов и поездки в музеи, просмотр
    достопримечательностей.`
      })
    ],
  },
}

requestIdleCallback(() => {
  const modal = new Modal('#universities-modal')

  const $modalElems: Record<string, HTMLElement | null> = {}

  const placeUniversityContent = ( university: UUniversities ) => {
    if(!$modalElems.title) {
      $modalElems.title = modal.$mask.querySelector('.modal__title')
      $modalElems.content = modal.$mask.querySelector('.modal__content')
    }

    const $logoImg = createCImg({
      'sources': universitiesInfo[university].logo,
      'lowQualitySrc': universitiesInfo[university].lowQualityLogo,
      class: "universities__modal-logo",
      width: '100%',
      alt: `${university} логотип`
    })


    const content = (() => {
      if(modalContentMap.has(university)) {
        console.log('старый')
        return modalContentMap.get(university)!
      }

      const content = universitiesInfo[university].content.map( fn => fn())
      modalContentMap.set(university, content)

      return content
    })()

    $modalElems.content?.replaceChildren($logoImg, ...content)
  }

  document.querySelectorAll('.universities__card-button').forEach( $btn => {
    $btn.addEventListener('click', (e) => {
        console.log(($btn as HTMLElement).dataset)
        placeUniversityContent( ($btn as HTMLElement).dataset['university'] as UUniversities)

        if(modal.visible) {
          modal.hide()
        } else {
          modal.show()
        }
    })
  })
})
