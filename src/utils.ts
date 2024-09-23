import { edgeGlobals } from 'edge.js'

/**
 * @see https://github.com/livewire/livewire/blob/main/src/Drawer/Utils.php#L13
 */
export function insertAttributesIntoHtmlRoot(html: string, attributes: Record<string, any>) {
  // TODO: avoid mutating attributes
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === 'object') {
      attributes[key] = edgeGlobals.html.escape(JSON.stringify(value))
    }
  }

  const attributesStr = edgeGlobals.html.attrs(attributes).value

  const regex = new RegExp(/(?:\n\s*|^\s*)<([a-zA-Z0-9\-]+)/)

  const matches = html.match(regex)

  if (!matches) {
    // TODO: Error
    throw new Error('Missing root')
  }

  const leftEndAt = matches[1].length + 1

  const left = html.slice(0, leftEndAt)
  const right = html.slice(leftEndAt)

  return `${left} ${attributesStr}${right}`
}
