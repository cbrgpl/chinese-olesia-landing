import { Modal } from "../libs/modal";

type IUniversityInfo = {
  logo: string;
  title: string;
  text: string;
}

type UUniversities = 'shandong' | 'unnan' | 'shanghai'
const universitiesInfo: Record<UUniversities, IUniversityInfo>  = {
  'shandong': {
    logo: '/university_shandong_logo.jpg',
    title: 'Shandong University of Technology',
    text: `<img style="float: right; height: 75vw; max-height: 380px" src="/shandong_modal_1.jpg" />
           <p class="universities__modal-paragraph">
             Университет с дружелюбной атмосферой для иностранных студентов и не менее сильной языковой подготовкой.
           </p>
           <p class="universities__modal-paragraph">
             Во время обучения был упор на изучение грамматики китайского языка, тренировки аудирования говорения, а также подготовке к экзамену HSK. Помимо
             основных предметов также посещала обучение каллиграфии и искусству игры на гучжэне ( традиционный китайский музыкальный инструмент).
           </p>
           <p style="margin-bottom: 0" class="universities__modal-paragraph">
             Языковой год был насыщен не только учебой, но и разными культурными мероприятиями, многие из них специально были организованы для иностранных
             студентов университета.
           </p>
           <img style="float: left; max-width: 380px; margin-top: 1rem" src="/shandong_modal_2.jpg" width="100%" />
            `
  } ,
  'unnan':{
    logo: '/university_unnan_logo.jpg',
    title: 'Unnan University',
    text: `<img style="float: right; height: 70vw; max-height: 280px; margin-left: 5px" src="/unnan_modal_1.jpg" />
           <p class="universities__modal-paragraph">
             Один из десяти ключевых университетов страны, которые содействуют преподаванию китайского языка в соседних странах, под руководством
             Международного Совета по китайскому языку. Университет с сильной академической подготовкой и строгими правилами к студентам.
           </p>
           <p class="universities__modal-paragraph">
             Каждый семестр необходимо проходить дополнительные курсы помимо пар по специальности. Поэтому кроме экономических предметов и бизнес пар
             дополнительно изучила основы и особенности перевода, китайские традиционные орнаменты и т.д.
           </p>
           <div style="margin-top: 10px">
             <img style="float: left; height: 60vw; max-height: 280px; margin-right: 5px" src="/unnan_modal_2.jpg" />
             <p style="margin-bottom: 0" class="universities__modal-paragraph">
               За четыре года множество раз участвовала в совместных проектах с китайскими студентами, была лидером группы маркетинговых исследований.
               Занималась подготовкой, анализом и реализацией академического проекта по пограничной торговле между Россией и Китаем.
             </p>
             <img style="max-width: 380px; display: block; margin: auto;" src="/unnan_modal_3.jpg" width="100%" />
           </div>`
  },
  'shanghai':{
    logo: '/university_shanghai_logo.jpg',
    title: 'Shanghai University of Finance and Econimics',
    text: `<p class="universities__modal-paragraph">
             Благодаря весомой академической репутации университет занимает 3 место по Китаю и 120 по миру. Преподаватели лояльны и дружелюбны к иностранным
             студентам, можно отметить отличного уровня организацию мероприятий и процесса обучения.
           </p>
           <img style="float: right; height: 70vw; max-height: 380px; margin-left: 5px" src="/shanghai_modal_1.jpg" />
           <p class="universities__modal-paragraph">
             Помимо бизнес китайского посещала курс по улучшению навыков письма на китайском языке, культуре деловых переговорах, освоила необходимую лексику
             в бизнес сфере. Принимала участие в конференции для предпринимателей, где применила полученные знания в устном и письменном переводе.
           </p>
           <img style="max-width: 400px" src="/shanghai_modal_2.jpg" width="100%" />
           <p class="universities__modal-paragraph">
             Университет помогал понять культуру Китая, периодически устраивал собрания для иностранных студентов и поездки в музеи, просмотр
             достопримечательностей.
           </p>`
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

    $modalElems.content!.innerHTML = `<img class="universities__modal-logo" src="${universitiesInfo[university].logo}" />
${universitiesInfo[university].text}`
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
