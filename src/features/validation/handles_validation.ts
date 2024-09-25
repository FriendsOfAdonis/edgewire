export type Constructor = new (...args: any[]) => {}

export function HandlesValidation<T extends Constructor>(superclass: T) {
  return class HandlesValidationImpl extends superclass {}
}
