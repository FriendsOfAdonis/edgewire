/*
|--------------------------------------------------------------------------
| Test runner entrypoint
|--------------------------------------------------------------------------
|
| The "test.ts" file is the entrypoint for running tests using Japa.
|
| Either you can run this file directly or use the "test"
| command to run this file and monitor file changes.
|
*/

process.env.NODE_ENV = 'test'
process.env.PORT = '3332'

import 'reflect-metadata'
import { prettyPrintError } from '@adonisjs/core'
import { configure, processCLIArgs, run } from '@japa/runner'
import { IgnitorFactory } from '@adonisjs/core/factories'
import { HttpContext } from '@adonisjs/core/http'
import edge from 'edge.js'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../tmp', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new IgnitorFactory()
  .merge({
    rcFileContents: {
      providers: [
        () => import('../providers/edgewire_provider.js'),
        () => import('@adonisjs/core/providers/edge_provider'),
      ],
    },
  })
  .withCoreConfig()
  .withCoreProviders()
  .create(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {})
    app.starting(async () => {
      app.config.set('edgewire.viewPath', 'viewPath')

      const router = await app.container.make('router')
      router.get('/edgewire/test', ({ request }: HttpContext) => {
        const { name, params } = request.qs()
        return edge.renderRaw(`@!edgewire('${name}')`)
      })
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .testRunner()
  .configure(async (app) => {
    const { runnerHooks, ...config } = await import('../tests/bootstrap.js')

    processCLIArgs(process.argv.splice(2))
    configure({
      suites: [
        {
          name: 'functional',
          files: ['tests/functional/**/*.spec.(js|ts)'],
        },
        {
          name: 'unit',
          files: ['tests/unit/**/*.spec.(js|ts)'],
        },
      ],
      ...config,
      ...{
        setup: runnerHooks.setup,
        teardown: runnerHooks.teardown.concat([() => app.terminate()]),
      },
    })
  })
  .run(() => run())
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
