import { isArray, isString, isObject } from '.'

// 标准化class
export function normalizeClass(value): string {
  let res = ''
  if (isString(value)) {
    res = value
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i])
      if (normalized) {
        res += normalized + ' '
      }
    }
  } else if (isObject(value)) {
    for (const name in value as object) {
      if (value[name]) {
        res += name + ' '
      }
    }
  }
  return res.trim()
}
