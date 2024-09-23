import app from '@adonisjs/core/services/app'
import { Edgewire } from '../src/edgewire.js'

let edgewire: Edgewire

await app.booted(async () => {
  edgewire = await app.container.make(Edgewire)
})

export { edgewire as default }
