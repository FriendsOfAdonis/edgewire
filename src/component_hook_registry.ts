import { ComponentHook, ComponentHookEvents } from './component_hook.js'
import Hooks from '@poppinss/hooks'

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
