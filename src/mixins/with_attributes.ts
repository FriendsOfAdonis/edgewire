import { Constructor } from '../types.js'

export function WithAttributes<T extends Constructor>(Base: T) {
  return class WithAttributes extends Base {}
}
