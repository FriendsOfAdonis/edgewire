import { decode } from 'html-entities'

export function extractAttributeDataFromHtml(html: string, attribute: string) {
  const regex = new RegExp(`${attribute}="([^"]+)"`)
  const data = html.match(regex)

  if (!data?.length) {
    throw new Error('Attribute not found')
  }

  return JSON.parse(decode(data[1]))
}
