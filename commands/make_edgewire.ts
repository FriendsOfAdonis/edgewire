import { args, BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { stubsRoot } from '../stubs/main.js'
import string from '@adonisjs/core/helpers/string'
import path from 'node:path'

export default class MakeEdgewire extends BaseCommand {
  static commandName = 'make:edgewire'
  static description = 'Make a new Edgewire component'
  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: true,
  }

  @args.string({ description: 'Name of the migration file' })
  declare name: string

  async run() {
    const codemods = await this.createCodemods()

    const component = this.createComponent()
    const view = this.createView()

    await codemods.makeUsingStub(stubsRoot, 'make/edgewire/component.stub', {
      component,
      view,
    })

    await codemods.makeUsingStub(stubsRoot, 'make/edgewire/view.stub', {
      component,
      view,
    })

    const morph = await codemods.getTsMorphProject()

    if (!morph) {
      this.logger.warning(
        'An issue occured when retrieving ts-morph. start/view.ts has not been updated'
      )
      return
    }

    const startView = morph.getSourceFileOrThrow('start/view.ts')

    startView.addImportDeclaration({
      moduleSpecifier: component.importPath,
      defaultImport: component.className,
    })

    startView.addStatements(`edgewire.component('${component.name}', ${component.className})`)

    await startView.save()
  }

  createView() {
    return {
      path: 'edgewire',
      fileName: string.create(this.name).snakeCase().ext('.edge').toString(),
      templatePath: path.join('edgewire', string.create(this.name).snakeCase().toString()),
    }
  }

  createComponent() {
    return {
      path: '',
      name: string.create(this.name).snakeCase().toString(),
      className: string.create(this.name).pascalCase().suffix('Component').toString(),
      fileName: string.create(this.name).snakeCase().ext('.ts').toString(),
      importPath: ['#components', string.create(this.name).snakeCase().toString()].join('/'),
    }
  }
}
