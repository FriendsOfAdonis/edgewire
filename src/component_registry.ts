// TODO: Add ability to register component without name (infer name from class)
import string from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'

export class ComponentRegistry {
  #aliases = new Map()

  public component(name: string, component: any) {
    this.#aliases.set(name, component)
  }

  public new(ctx: HttpContext, name: string, id?: string) {
    const Component = this.getClass(name)
    const component = new Component(name, id ?? string.random(20), ctx)
    return component
  }

  private getClass(name: string) {
    return this.#aliases.get(name)
  }
}
