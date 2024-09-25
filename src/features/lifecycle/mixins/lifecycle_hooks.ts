import Hooks from '@poppinss/hooks'
import { View } from '../../../view.js'

type Events = {
  boot: [[], []]
  initialize: [[], []]
  mount: [[], []]
  hydrate: [[], []]
  exception: [[unknown, boolean], []]
  rendering: [[View, any], []]
  rendered: [[View, string], []]
  dehydrate: [[], []]
  booted: [[], []]
}

type Constructor = new (...args: any[]) => {
  mount?(...args: any[]): void
}

export function LifecycleHooks<T extends Constructor>(superclass: T) {
  return class LifecycleHooksImpl extends superclass {
    #hooks: Hooks<Events>

    constructor(...args: any[]) {
      super(...args)
      this.#hooks = new Hooks()

      if (this.mount) {
        this.#hooks.add('mount', this.mount)
      }
    }

    public get hooks(): Hooks<Events> {
      return this.#hooks
    }
  }
}
