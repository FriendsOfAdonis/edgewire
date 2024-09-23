import { inject } from '@adonisjs/core'
import { Component } from './component.js'
import { ComponentRegistry } from './component_registry.js'
import { insertAttributesIntoHtmlRoot } from './utils.js'
import { ComponentSnapshot, ComponentCall, ComponentUpdates } from './types.js'
import { ComponentContext } from './component_context.js'
import { E_INVALID_CHECKSUM } from './errors.js'
import { generateChecksum, verifyChecksum } from './utils/checksum.js'
import { View } from './view.js'
import string from '@adonisjs/core/helpers/string'
import { getPublicProperties } from './utils/object.js'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import emitter from '@adonisjs/core/services/emitter'

@inject()
export class HandleComponents {
  #componentsRegistry: ComponentRegistry

  constructor(edgewire: ComponentRegistry) {
    this.#componentsRegistry = edgewire
  }

  async mount(name: string, ctx: HttpContext) {
    const component = this.#componentsRegistry.new(ctx, name)
    const context = new ComponentContext(component, true)

    let html = await this.#render(component)

    emitter.emit('edgewire:hydrate', { component, context })

    html = insertAttributesIntoHtmlRoot(html, {
      'wire:effects': [],
      'wire:snapshot': this.#snapshot(component),
    })

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
      'wire:effects': [],
      'wire:snapshot': newSnapshot,
    })

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

    emitter.emit('edgewire:render', { component, view, properties })

    let html = await view.render()
    html = insertAttributesIntoHtmlRoot(html, {
      'wire:id': component.id,
    })

    emitter.emit('edgewire:render:after', { component, view, properties })

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
