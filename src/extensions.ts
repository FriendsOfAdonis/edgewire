import { Template } from 'edge.js'
import { Edgewire } from './edgewire.js'
import edgewire from '../services/edgewire.js'
import { Application } from '@adonisjs/core/app'

// TODO: Might want to avoid using global
Template.getter('edgewire', function (this: Template) {
  return edgewire
})

Application.macro('componentsPath', function <
  T extends Record<any, any>,
>(this: Application<T>, ...paths: string[]) {
  return this.makePath('app', 'components', ...paths)
})

declare module 'edge.js' {
  interface Template {
    edgewire: Edgewire
  }
}

declare module '@adonisjs/core/app' {
  interface Application<ContainerBindings extends Record<any, any>> {
    componentsPath(...paths: string[]): string
  }
}
