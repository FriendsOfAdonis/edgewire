import Hooks from '@poppinss/hooks'
import { ComponentHook, ComponentHookEvents } from './main.js'

export class ComponentHookRegistry {
  components: ComponentHook[] = []
  hooks: Hooks<ComponentHookEvents>

  constructor() {
    this.hooks = new Hooks()
  }

  async register(Hook: ComponentHook) {
    Hook(this.hooks)
  }
}
