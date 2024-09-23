import edge, { edgeGlobals } from 'edge.js'
import { TagContract } from 'edge.js/types'

export const edgewireScriptsTag: TagContract = {
  tagName: 'edgewireScripts',
  seekable: true,
  block: false,
  compile(parser, buffer, token) {
    const url = '/livewire.js'

    const csrf = '' // TODO: Generate CSRF
    const updateUri = '/edgewire/update'

    buffer.outputRaw(
      `<script src="${url}" data-csrf="${csrf}" data-update-uri="${updateUri}"></script>`
    )
  },
}
