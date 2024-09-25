import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ComponentManager } from '../component/manager.js'

@inject()
export class RequestManager {
  #componentManager: ComponentManager

  constructor(componentManager: ComponentManager) {
    this.#componentManager = componentManager
  }

  public async handleUpdate(ctx: HttpContext) {
    const payloads = ctx.request.body().components // TODO: Type this

    const componentResponses = []
    for (const payload of payloads) {
      const { snapshot, effects } = await this.#componentManager.update(
        JSON.parse(payload.snapshot),
        payload.updates,
        payload.calls,
        ctx
      )

      componentResponses.push({ snapshot: JSON.stringify(snapshot), effects })
    }

    const response = {
      components: componentResponses,
    }

    return response
  }
}
