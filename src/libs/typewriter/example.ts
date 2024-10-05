import { TypeWriter, TypeWritterHtml, TextsContainer } from "./typewriter";


/*

HTML:
<div class="buttons-container">
  <button id="prev" class="button"> prev </button>
  <button id="next" class="button"> next </button>
</div>

<div class="text-block"></div>

CSS:
.buttons-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.button {
  border: 1px solid blue;
  color: white;
  font-weight: 500;
  padding: 0.25rem;
  background: #212;
  cursor: pointer;
  margin: auto 1rem;
}

.button:hover {
  color: #dedede;
}

.button:active {
  color: #c1c1c1;
}

button {
  margin-bottom: 1rem;
}

#text {
  width: 350px;
  border: 1px solid red;
  padding: 1em;
}

.text-block {
  transition: all 350ms ease;
}

.text-block--hidden {
  transform: translateY(-15%);
  opacity: 0;
}


*/
const texts = new TextsContainer([
  "Жизнь идет своим чередом, люди работают, учатся и стремятся к успеху. В каждом городе есть история, которая вдохновляет на подвиги. Природа радует своим величием, а семья поддерживает в трудные времена. Машины едут по дорогам, телефоны звенят, дети учат уроки, студенты готовятся к экзаменам. Книги и фильмы открывают новые горизонты. Музыка звучит на фестивалях, программы развивают технологии. Каждый день приносит новые возможности. Любовь движет миром, знание открывает двери. Планы строятся, проекты реализуются. Работа – это путь к достижению мечты.",
  "На улице стояла прохладная осенняя погода. Деревья уже почти сбросили свои листья, и воздух был наполнен свежим запахом земли и увядающей листвы. Люди спешили по своим делам, закутавшись в тёплые шарфы и пальто. Кто-то держал в руках чашку горячего кофе, наслаждаясь его ароматом, а кто-то задумчиво смотрел на падающие листья, погружённый в свои мысли.",
  "Утро начиналось с первых лучей солнца, которые мягко пробивались сквозь тонкие облака. Город просыпался, и улицы начинали оживать от звука машин и шагов прохожих. В парке уже гуляли молодые родители с детьми, а старушки сидели на лавочках и обсуждали последние новости. Ветер ласково качал ветви деревьев, играя с их листьями, которые тихо шуршали под ногами прохожих.",
  "В тёмной комнате лишь слабый свет лампы освещал стол с разбросанными книгами. Тишина была абсолютной, за окном не было слышно ни звука. Листья шуршали где-то вдали, а человек за столом не отрывал взгляда от страницы, читая сложный текст. Время, казалось, остановилось, и ничто не могло нарушить этот момент сосредоточенности."
]);

let $textBlock = document.querySelector(".text-block") as HTMLElement | null;

if (!$textBlock) {
  throw new Error('There is no element for ".text-block" selector');
}

const typeWriterTarget = new TypeWritterHtml($textBlock);
const typeWriter = new TypeWriter(typeWriterTarget);

(async () => {
  typeWriter.writeText(texts.next, { replaceAll: true });
})();

const waitForTransitionend = ($el: HTMLElement) => {
  let resolvePromise: null | ((v: null) => void) = null;

  const promise = new Promise((res) => {
    resolvePromise = res;
  });

  $el.addEventListener("transitionend", (e) => {
    if (e.target !== $el) {
      return;
    }

    if (resolvePromise) {
      resolvePromise(null);
    }
  });

  return promise;
};

const getButtonsHandler = (cb: (...args: any[]) => Promise<unknown>) => {
  let lastCallStatus: { aborted: boolean } = { aborted: false };
  return async (...args: any[]) => {
    lastCallStatus.aborted = true;
    const currentCallStatus = { aborted: false };
    lastCallStatus = currentCallStatus;

    typeWriter.abortWriting();
    const onHidePromise = waitForTransitionend($textBlock!);
    $textBlock!.classList.add("text-block--hidden");
    await onHidePromise;

    if (currentCallStatus.aborted) {
      return;
    }

    $textBlock!.innerHTML = "";
    $textBlock!.classList.remove("text-block--hidden");

    await waitForTransitionend($textBlock!);
    console.log("await watForTransitionend");

    if (currentCallStatus.aborted) {
      return;
    }

    cb(...args);
  };
};

const buttonsHandler = getButtonsHandler(
  async (buttonType: "next" | "prev") => {
    if (buttonType === "next") {
      typeWriter.writeText(texts.next, {});
    } else {
      typeWriter.writeText(texts.prev, {});
    }
  }
);

document
  .querySelector("#next")!
  .addEventListener("click", async () => buttonsHandler("next"));
document
  .querySelector("#prev")!
  .addEventListener("click", async () => buttonsHandler("prev"));
