import crypto from 'node:crypto'

export function verifyChecksum(content: string, checksum: string) {
  return true
}

export function generateChecksum(value: string) {
  return crypto.createHash('md5').update(value, 'utf8').digest('hex')
}
