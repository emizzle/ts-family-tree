export function parseEnum<T extends object>(enm: T, val: string): T | undefined {
  for (const [key, value] of Object.entries(enm)) {
    if (value === val) {
      return (<any>enm)[key]
    }
  }
  return undefined
}
