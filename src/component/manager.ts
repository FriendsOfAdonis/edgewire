import { inject } from '@adonisjs/core'
import string from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { ComponentRegistry } from './registry.js'
import { ComponentHookRegistry } from '../component_hook/registry.js'
import { insertAttributesIntoHtmlRoot } from '../utils.js'
import { ComponentCall, ComponentSnapshot, ComponentUpdates } from '../types.js'
import { Component } from './main.js'
import { getPublicProperties } from '../utils/object.js'
import { View } from '../view.js'
import { ViewContext } from '../view_context.js'
import { ComponentContext } from './context.js'
import { generateChecksum, verifyChecksum } from '../utils/checksum.js'
import { E_INVALID_CHECKSUM } from '../errors.js'

@inject()
export class ComponentManager {
  #componentsRegistry: ComponentRegistry
  #componentHookRegistry: ComponentHookRegistry

  constructor(componentsRegistry: ComponentRegistry, componentHookRegistry: ComponentHookRegistry) {
    this.#componentsRegistry = componentsRegistry
    this.#componentHookRegistry = componentHookRegistry
  }

  async mount(name: string, ctx: HttpContext) {
    const component = this.#componentsRegistry.new(ctx, name)

    const mount = this.#componentHookRegistry.hooks.runner('mount')

    await mount.run(component, {})

    let html = await this.#render(component)

    html = insertAttributesIntoHtmlRoot(html, {
      'wire:effects': [],
      'wire:snapshot': this.#snapshot(component),
    })

    await mount.cleanup(html)

    return html
  }

  async update(
    snapshot: ComponentSnapshot,
    updates: ComponentUpdates,
    calls: ComponentCall[],
    ctx: HttpContext
  ) {
    const { component, context } = this.#fromSnapshot(snapshot, ctx)
    const { data, memo } = snapshot

    this.#updateProperties(component, updates, data, context)
    this.#callMethods(component, calls, context)

    const newSnapshot = this.#snapshot(component, context)

    let html = await this.#render(component)
    html = insertAttributesIntoHtmlRoot(html, {
      'wire:snapshot': newSnapshot,
    })

    context.addEffect('html', html)

    return { snapshot: newSnapshot, effects: context.effects }
  }

  async #getView(component: Component) {
    let view: View
    const viewPath = app.config.get('edgewire.viewPath')
    const properties = getPublicProperties(component)
    if (component.render) {
      const output = await component.render()
      if (typeof output === 'string') {
        view = View.raw(output, properties)
      } else {
        view = output.with(properties)
      }
    } else {
      const name = string.create(component.name).removeSuffix('component').dashCase().toString()
      view = View.template(`${viewPath}/${name}`, properties)
    }

    return { view, properties }
  }

  async #render(component: Component, _default?: string): Promise<string> {
    const { view, properties } = await this.#getView(component)
    const viewContext = new ViewContext()

    const render = this.#componentHookRegistry.hooks.runner('render')
    await render.run(component, view, properties)

    let html = await view.render()
    html = insertAttributesIntoHtmlRoot(html, {
      'wire:id': component.id,
    })

    const replaceHtml = (newHtml: string) => {
      html = newHtml
    }

    await render.cleanup(html, replaceHtml, viewContext)

    return html
  }

  #snapshot(component: Component, context?: ComponentContext): ComponentSnapshot {
    const data = this.#dehydrateProperties(component, context)

    const snapshot: Omit<ComponentSnapshot, 'checksum'> = {
      data,
      memo: {
        id: component.id,
        name: component.name,
        children: [],
      },
    }

    return {
      ...snapshot,
      checksum: generateChecksum(JSON.stringify(snapshot)),
    }
  }

  #fromSnapshot(snapshot: ComponentSnapshot, ctx: HttpContext) {
    const { checksum, ..._snapshot } = snapshot

    if (!verifyChecksum(JSON.stringify(_snapshot), checksum)) {
      throw new E_INVALID_CHECKSUM([snapshot.memo.name])
    }

    const component = this.#componentsRegistry.new(ctx, snapshot.memo.name, snapshot.memo.id)
    const context = new ComponentContext(component)

    this.#hydrateProperties(component, snapshot.data, context)

    return { component, context }
  }

  #dehydrateProperties(component: Component, context?: ComponentContext) {
    const data: any = {}

    for (const propertyName of Object.getOwnPropertyNames(component)) {
      // @ts-ignore
      data[propertyName] = component[propertyName]
    }

    return data
  }

  #hydrateProperties(
    component: Component,
    data: ComponentSnapshot['data'],
    context: ComponentContext
  ) {
    for (const [key, value] of Object.entries(data)) {
      // TODO: Check if property exists

      // @ts-ignore
      component[key] = value
    }
  }

  #updateProperties(
    component: Component,
    updates: ComponentUpdates,
    data: ComponentSnapshot['data'],
    context: ComponentContext
  ) {
    for (const [path, value] of Object.entries(updates)) {
      this.#updateProperty(component, path, value, context)
    }
  }

  #updateProperty(component: Component, path: string, value: string, context: ComponentContext) {
    // TODO: Handle path segments
    // @ts-ignore
    component[path] = value
  }

  #callMethods(component: Component, calls: ComponentCall[], context: ComponentContext) {
    const returns = []
    for (const call of calls) {
      const { method, params } = call

      // @ts-ignore
      component[method](...params)
    }

    // TODO: Add context effect
  }
}
