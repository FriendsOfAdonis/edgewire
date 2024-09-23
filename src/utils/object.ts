export function getPublicProperties(object: any) {
  const output: Record<string, any> = {}

  for (const propertyName of Object.getOwnPropertyNames(object)) {
    output[propertyName] = object[propertyName]
  }

  return output
}
