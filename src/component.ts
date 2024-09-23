import { HttpContext } from '@adonisjs/core/http'
import { View } from './view.js'
import { compose } from '@adonisjs/core/helpers'
import { WithAttributes } from './mixins/with_attributes.js'

class BaseComponent {}

export abstract class Component extends compose(BaseComponent, WithAttributes) {
  #id: string
  #name: string
  #ctx: HttpContext

  constructor(name: string, id: string, ctx: HttpContext) {
    super()
    this.#id = id
    this.#name = name
    this.#ctx = ctx
  }

  render?(): Promise<string | View>
  mount?(args: Record<string, any>): void

  public get id() {
    return this.#id
  }

  public get name() {
    return this.#name
  }

  public get ctx() {
    return this.#ctx
  }
}
