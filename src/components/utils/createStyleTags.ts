
/** @description Used to create style tags for .css files for web-component. Styles must be added in shadow dom;
 *
 */
export const createStyleTags = (styleSheets: string[]) => {
  return styleSheets.map( sheet => {
    const $style = document.createElement('style')
    $style.textContent = sheet
    return $style
  })
}
