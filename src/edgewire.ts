import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { View } from './view.js'
import { ComponentRegistry } from './component/registry.js'
import { ComponentHookRegistry } from './component_hook/registry.js'
import { ComponentHook } from './component_hook/main.js'
import { ComponentManager } from './component/manager.js'
import { RequestManager } from './request/manager.js'

@inject()
export class Edgewire {
  #componentRegistry: ComponentRegistry
  #componentHookRegistry: ComponentHookRegistry

  #componentsManager: ComponentManager
  #requestManager: RequestManager

  constructor(
    componentRegistry: ComponentRegistry,
    componentHookRegistry: ComponentHookRegistry,
    componentManager: ComponentManager,
    requestManager: RequestManager
  ) {
    this.#componentRegistry = componentRegistry
    this.#componentHookRegistry = componentHookRegistry
    this.#componentsManager = componentManager
    this.#requestManager = requestManager
  }

  component(name: string, component: any) {
    this.#componentRegistry.component(name, component)
  }

  mount(name: string, ctx: HttpContext) {
    return this.#componentsManager.mount(name, ctx)
  }

  handleUpdate(ctx: HttpContext) {
    return this.#requestManager.handleUpdate(ctx)
  }

  view(templatePath: string, state: Record<string, any> = {}) {
    return View.template(templatePath, state)
  }

  componentHook(hook: ComponentHook) {
    this.#componentHookRegistry.register(hook)
  }
}
