import edge from 'edge.js'

export class View {
  constructor(
    private templatePath?: string,
    private content?: string,
    private state: Record<string, any> = {}
  ) {}

  render() {
    if (this.templatePath) {
      return edge.render(this.templatePath, this.state)
    }

    if (this.content) {
      return edge.renderRaw(this.content, this.state)
    }

    throw new Error('THis should not happen')
  }

  with(state: Record<string, any>) {
    this.state = {
      ...this.state,
      ...state,
    }
    return this
  }

  static raw(content: string, state: Record<string, any> = {}) {
    return new View(undefined, content, state)
  }

  static template(templatePath: string, state: Record<string, any> = {}) {
    return new View(templatePath, undefined, state)
  }
}

export function view(templatePath: string, state: Record<string, any> = {}) {
  return View.template(templatePath, state)
}
