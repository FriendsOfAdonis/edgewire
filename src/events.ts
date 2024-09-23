import { Component } from './component.js'
import { ComponentContext } from './component_context.js'
import { View } from './view.js'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'edgewire:render': { component: Component; view: View; properties: Record<string, any> }
    'edgewire:render:after': { component: Component; view: View; properties: Record<string, any> }

    'edgewire:hydrate': { component: Component; context: ComponentContext }
  }
}
