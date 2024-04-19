/**
 * Function for removing spaces and other characters from words,
 * so it can be used as a CSS class name
 */
export function camelize(str: string) {
  return str.replace(
    /(?:^\w|[A-Z]|\b\w|\s+)/g,
    function (match: string, index: number) {
      if (+match === 0) return '' // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase()
    }
  ).replace(/[^a-zA-Z0-9]+/g, '')
}
