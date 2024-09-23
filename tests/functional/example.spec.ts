import 'reflect-metadata'
import { test } from '@japa/runner'
import { Testable } from '../testable.js'
import { TestComponent } from '../utils/test_component.js'

class HelloComponent extends TestComponent {}

test.group('Example', () => {
  test('add two numbers', async ({ assert, client }) => {
    await Testable.create(client, HelloComponent, {})
  })
})
