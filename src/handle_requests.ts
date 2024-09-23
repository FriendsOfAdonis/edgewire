import { HttpContext } from '@adonisjs/core/http'
import { HandleComponents } from './handle_components.js'
import { inject } from '@adonisjs/core'

@inject()
export class HandleRequests {
  #handleComponents: HandleComponents

  constructor(handleComponents: HandleComponents) {
    this.#handleComponents = handleComponents
  }

  public async handleUpdate(ctx: HttpContext) {
    const payloads = ctx.request.body().components // TODO: Type this

    const componentResponses = []
    for (const payload of payloads) {
      const { snapshot, effects } = await this.#handleComponents.update(
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
