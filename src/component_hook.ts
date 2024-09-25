import Hooks from '@poppinss/hooks'
import { Component } from './component.js'
import { View } from './view.js'
import { ViewContext } from './view_context.js'

export type ComponentHookEvents = {
  boot: [[Component], []]
  mount: [[Component, any], [string]]
  hydrate: [[Component], []]
  update: [[Component, string, string, any], []]
  call: [[Component, string, any[], boolean], []]
  exception: [[Component, unknown, boolean], []]
  render: [[Component, View, any], [string, (html: string) => any, ViewContext]]
  dehydrate: [[Component], []]
}

export type ComponentHook = (hooks: Hooks<ComponentHookEvents>) => void
