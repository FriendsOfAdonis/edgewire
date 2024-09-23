import { Component } from './component.js'

export class ComponentContext {
  readonly isMounting: boolean
  readonly component: Component

  effects: any = {}
  #memo = []

  constructor(component: Component, isMounting = false) {
    this.component = component
    this.isMounting = isMounting
  }

  addEffect(key: string, value: string) {
    this.effects[key] = value
  }
}
