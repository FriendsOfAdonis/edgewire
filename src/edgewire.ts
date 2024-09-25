import { inject } from '@adonisjs/core'
import { ComponentRegistry } from './component_registry.js'
import { HandleComponents } from './handle_components.js'
import { HandleRequests } from './handle_requests.js'
import { HttpContext } from '@adonisjs/core/http'
import { View } from './view.js'
import { ComponentHook } from './component_hook.js'
import { ComponentHookRegistry } from './component_hook_registry.js'

@inject()
export class Edgewire {
  #componentRegistry: ComponentRegistry
  #componentHookRegistry: ComponentHookRegistry
  #handleComponents: HandleComponents
  #handleRequests: HandleRequests

  constructor(
    componentRegistry: ComponentRegistry,
    componentHookRegistry: ComponentHookRegistry,
    handleComponents: HandleComponents,
    handleRequests: HandleRequests
  ) {
    this.#componentRegistry = componentRegistry
    this.#componentHookRegistry = componentHookRegistry
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

  componentHook(hook: ComponentHook) {
    this.#componentHookRegistry.register(hook)
  }
}
