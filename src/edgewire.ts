import { inject } from '@adonisjs/core'
import { ComponentRegistry } from './component_registry.js'
import { HandleComponents } from './handle_components.js'
import { HandleRequests } from './handle_requests.js'
import { HttpContext } from '@adonisjs/core/http'
import { View } from './view.js'

@inject()
export class Edgewire {
  #componentRegistry: ComponentRegistry
  #handleComponents: HandleComponents
  #handleRequests: HandleRequests

  constructor(
    componentRegistry: ComponentRegistry,
    handleComponents: HandleComponents,
    handleRequests: HandleRequests
  ) {
    this.#componentRegistry = componentRegistry
    this.#handleComponents = handleComponents
    this.#handleRequests = handleRequests
  }

  component(name: string, component: any) {
    this.#componentRegistry.component(name, component)
  }

  mount(name: string, ctx: HttpContext) {
    return this.#handleComponents.mount(name, ctx)
  }

  handleUpdate(ctx: HttpContext) {
    return this.#handleRequests.handleUpdate(ctx)
  }

  view(templatePath: string, state: Record<string, any> = {}) {
    return View.template(templatePath, state)
  }
}
