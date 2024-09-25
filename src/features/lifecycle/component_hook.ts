import Hooks from '@poppinss/hooks'
import { ComponentHookEvents } from '../../component_hook.js'

export const LifecycleComponentHook = (hooks: Hooks<ComponentHookEvents>) => {
  hooks.add('boot', async (component) => {
    await component.hooks.runner('boot').run()
    await component.hooks.runner('initialize').run()
    await component.hooks.runner('mount').run()
    await component.hooks.runner('booted').run()
  })

  hooks.add('render', async (component, view, data) => {
    await component.hooks.runner('rendering').run(view, data)
    return async (html) => {
      await component.hooks.runner('rendered').run(view, html)
    }
  })
}
