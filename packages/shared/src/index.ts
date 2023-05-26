export const isArray = Array.isArray
export const isObject = val => val != null && typeof val === 'object'
/**
 * 对比两个数据是否发生改变
 */
export const hasChanged = (value, oldValue) => Object.is(value, oldValue)

export const isFunction = val => typeof val === 'function'

export const extend = Object.assign

export const EMPTY_OBJ = {}

export const isString = val => typeof val === 'string'

const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)
