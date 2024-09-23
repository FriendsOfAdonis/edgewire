export type Constructor<T = any> = new (...args: any[]) => T

export type EdgewireConfig = {
  viewPath: string
}

export type ComponentSnapshot = {
  data: any
  checksum: string
  memo: {
    id: string
    name: string
    [key: string]: any
  }
}

export type ComponentUpdates = Record<string, any>

export type ComponentEffect = any

export type ComponentCall = {
  path: string | null
  method: string
  params: any[]
}
