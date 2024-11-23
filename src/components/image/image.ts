// @ts-ignore
import imageStyles from './image.css?inline'

import {createStyleTags} from './../utils/createStyleTags'

const OBSERVED_EL_ID_ATTR = 'data-observing-id'

let getId = (( ) => {
  let id = 0;
  return () => (id++).toString()
})()

const imageLoadingUnlocks: Array<() => void> = []
const waitUntilLoadingAllowed = async () => new Promise(( resolve ) => {
  imageLoadingUnlocks.push( () => resolve(null) )
})
let imagesLoadingAvailable = false
const allowImagesLoading = () => {
  imagesLoadingAvailable = true
  imageLoadingUnlocks.forEach( unlock => unlock())
}

const imageInViewportUnlockersMap = new Map<string, () => void>()
const intersectionObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach( entry => {
    if(entry.isIntersecting) {
      const $target = entry.target as HTMLElement


      const targetId = $target.getAttribute(OBSERVED_EL_ID_ATTR)
      console.log('Во вьюпорте', targetId)

      if(targetId === null) {
        throw new Error(`Couldn't start loading an image bacause no id in ${OBSERVED_EL_ID_ATTR}`, { cause: { id: targetId }})
      }

      const unlockImageLoading = imageInViewportUnlockersMap.get(targetId)

      if(!unlockImageLoading) {
        throw new Error(`Couldn't start loading an image bacause no "unlockImageLoading" fn in map`, { cause: { id: targetId }})
      }

      unlockImageLoading()

      observer.unobserve($target)
    }
  })
}, {
  rootMargin: "150px 0px 0px 0px",
}
)

// src;type,src;type,src;type
type ISources = Array<{ src: string, type?: string }>
const parseSources = ( sourcesRaw: string | null ): ISources => {
  if(sourcesRaw === null) {
    throw new Error('No sources were provided on "sources" attribute')
  }

  return sourcesRaw.split(',').map( source => {
    const [src, type] = source.split(';')
    return { src, type }
  })
}

type IImageAttrs = {
  width?: string | null,
  height?: string | null,
  alt?: string | null
}

const createImgEl = ( src: string, attrs: IImageAttrs ) => {
  const $img = document.createElement('img')

  $img.setAttribute('src', src)

  if(attrs.alt) { $img.setAttribute('alt', attrs.alt) }

  $img.setAttribute('width', attrs.width?.toString() ?? '100%')
  $img.setAttribute('height', attrs.height?.toString() ?? '100%')

  return $img
}

class CImage extends HTMLElement {
  static readonly observedAttributes = [ "sources" ];
  private _id: string = getId()
  private _rendered = false

  private _createPictureEl( imageAttrs: IImageAttrs ): HTMLElement {
    const sources = parseSources(this.getAttribute('sources'))
    const $picture = document.createElement('picture')

    const $srcs = sources.map( ( source, inx ) => {
      const $source = document.createElement('source')

      if(inx === sources.length - 1) {
        const $img = createImgEl(source.src, imageAttrs)
        $img.setAttribute('part', 'image')
        $img.setAttribute('fetchpriority', 'low')
        $img.classList.add('c-image__img')
        return $img
      }

      $source.setAttribute('srcset', source.src)

      if(source.type) {
        $source.setAttribute('type', source.type)
      }

      return $source
    })

    $picture.append(...$srcs)

    return $picture
  }

  private _createLowQualityImg(imageAttrs: IImageAttrs) {
    const lowQualitySrc = this.getAttribute('low-quality-src')
    if(lowQualitySrc) {
      const $lowQualityImg = createImgEl(lowQualitySrc, {...imageAttrs, alt: null})
      $lowQualityImg.setAttribute('fetchpriority', 'high')
      $lowQualityImg.setAttribute('width', '100%')
      $lowQualityImg.setAttribute('height', '100%')
      $lowQualityImg.classList.add("c-image__low-quality-img")
      return $lowQualityImg
    }

    return null
  }

  private _createWrapper(imageAttrs: IImageAttrs): HTMLElement {
    const $wrapper = document.createElement('div')

    $wrapper.classList.add('c-image__wrapper')

    $wrapper.style.width = '100%'
    $wrapper.style.height = '100%'

    const placeholderRequired = this.getAttribute('no-placeholder') === null
    console.log(this._id, this.getAttribute('no-placeholder'))
    if(placeholderRequired) {
      const $placeholder = document.createElement('div')
      $placeholder.classList.add('c-image__placeholder')

      if(imageAttrs.alt) {
        $placeholder.innerText = imageAttrs.alt
      }

      $wrapper.appendChild($placeholder)
    }

    return $wrapper
  }

  _waitUntilImageInViewport( $wrapper: HTMLElement) {
    $wrapper.setAttribute(OBSERVED_EL_ID_ATTR, this._id)
    intersectionObserver.observe($wrapper)
    return new Promise(( resolve ) => {
      imageInViewportUnlockersMap.set(this._id, () => resolve(null))
    })
  }

  async connectedCallback() {
    if(this._rendered) { return }

    this._rendered = true
    const $shadow = this.attachShadow({ mode: 'open' })

    this.style.display = 'block'
    // TODO I should optimize it cause it is appended in every usage of webcomponent
    const $styles = createStyleTags([
      imageStyles
    ])

    $shadow.append(...$styles)

    const imageAttrs = {
      alt: this.getAttribute('alt'),
      width: this.getAttribute('width'),
      height: this.getAttribute('height')
    }

    const $wrapper = this._createWrapper(imageAttrs)
    $shadow.append($wrapper)

    console.log('Жду пока буду во вьюпорте', this._id)
    await this._waitUntilImageInViewport($wrapper)
    console.log('Я во вьюпорте', this._id)

    if(!imagesLoadingAvailable) {
      console.log('Жду пока разрешат загрузку', this._id)
      await waitUntilLoadingAllowed()
    }

    console.log('Отображаю плохого качества картинку', this._id)
    const $lowQualityImg = this._createLowQualityImg( imageAttrs )
    if($lowQualityImg) {
      $wrapper.appendChild($lowQualityImg)
    }

    $lowQualityImg?.addEventListener('load', () => {
      const $picture = this._createPictureEl(imageAttrs)
      const $pictureImg = $picture.lastChild
      $pictureImg?.addEventListener('load', async () => {
        console.log('Отображаю хорошего качества картинку', this._id)

        if($lowQualityImg) {
          console.log('Заменяю плохую картинку на хорошую', this._id)
          $wrapper.replaceChild($picture, $lowQualityImg)
        } else {
          $wrapper.append($picture)
        }

      })
    })
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, oldValue, newValue) {}

}

customElements.define("c-img", CImage);
export { allowImagesLoading }
