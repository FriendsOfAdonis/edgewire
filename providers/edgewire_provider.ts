import edge from 'edge.js'
import { edgewireTag } from '../src/edge/tags/edgewire.js'
import { ApplicationService } from '@adonisjs/core/types'
import { ComponentRegistry } from '../src/component_registry.js'
import { edgewireScriptsTag } from '../src/edge/tags/edgewire_scripts.js'

export default class EdgewireProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    edge.registerTag(edgewireTag)
    edge.registerTag(edgewireScriptsTag)

    this.app.container.singleton(ComponentRegistry, () => {
      return new ComponentRegistry()
    })
  }

  async boot() {
    await import('../src/extensions.js')
  }

  async start() {}
}
