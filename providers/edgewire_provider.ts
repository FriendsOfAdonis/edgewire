import edge from 'edge.js'
import { edgewireTag } from '../src/edge/tags/edgewire.js'
import { ApplicationService } from '@adonisjs/core/types'
import { ComponentRegistry } from '../src/component_registry.js'
import { edgewireScriptsTag } from '../src/edge/tags/edgewire_scripts.js'
import { Edgewire } from '../src/edgewire.js'
import { LifecycleComponentHook } from '../src/features/lifecycle/component_hook.js'
import { ComponentHookRegistry } from '../src/component_hook_registry.js'
import { ValidationComponentHook } from '../src/features/validation/component_hook.js'

export default class EdgewireProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    edge.registerTag(edgewireTag)
    edge.registerTag(edgewireScriptsTag)

    this.app.container.singleton(ComponentRegistry, () => {
      return new ComponentRegistry()
    })

    this.app.container.singleton(ComponentHookRegistry, () => {
      return new ComponentHookRegistry()
    })
  }

  async boot() {
    await import('../src/extensions.js')

    const router = await this.app.container.make('router')
    const edgewire = await this.app.container.make(Edgewire)

    router.post('/edgewire/update', (ctx) => edgewire.handleUpdate(ctx)).as('edgewire')

    for (const hook of [LifecycleComponentHook, ValidationComponentHook]) {
      edgewire.componentHook(hook)
    }
  }

  async start() {}
}
