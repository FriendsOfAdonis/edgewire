import emitter from '@adonisjs/core/services/emitter'
import edgewire from '../services/edgewire.js'
import { Component } from '../src/component.js'
import string from '@adonisjs/core/helpers/string'
import { ApiClient } from '@japa/api-client'
import { View } from '../src/view.js'
import { ComponentState } from './utils/component_state.js'
import { extractAttributeDataFromHtml } from './utils/html.js'

export class Testable {
  static async create(
    client: ApiClient,
    component: new (...args: any[]) => Component,
    params: Record<string, any>
  ) {
    const name = string.random(16)

    edgewire.component(name, component)

    await this.initialRender(client, name, params)
  }

  private static async initialRender(client: ApiClient, name: string, params: Record<string, any>) {
    const p = [
      new Promise<View>((res) => {
        emitter.once('edgewire:render', ({ view }) => {
          res(view)
        })
      }),
      new Promise<Component>((res) => {
        emitter.once('edgewire:hydrate', ({ component }) => {
          res(component)
        })
      }),
    ] as const

    const response = await client.get('/edgewire/test').qs('name', name).qs('params', params)

    const [view, component] = await Promise.all(p)

    const snapshot = extractAttributeDataFromHtml(response.text(), 'wire:snapshot')
    const effects = extractAttributeDataFromHtml(response.text(), 'wire:effects')

    return new ComponentState(component, response, view, snapshot, effects)
  }
}
