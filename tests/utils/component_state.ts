import { ApiResponse } from '@japa/api-client'
import { Component } from '../../src/component.js'
import { View } from '../../src/view.js'
import { ComponentEffect, ComponentSnapshot } from '../../src/types.js'

export class ComponentState {
  constructor(
    public component: Component,
    public response: ApiResponse,
    public view: View,
    public snapshot: ComponentSnapshot,
    public effects: ComponentEffect[]
  ) {}
}
