import { isOn } from '@vue/shared'
import { patchClass } from './modules/class'
import { patchDOMProp } from './modules/props'
import { patchAttr } from './modules/attrs'

export const patchProp = (el: Element, key, preValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
  } else if (isOn(key)) {
    // 事件
  } else if (shouldSetAsProp(el, key)) {
    // el[key]=value
    patchDOMProp(el, key, nextValue)
  } else {
    // setAttribute
    patchAttr(el, key, nextValue)
  }
}

function shouldSetAsProp(el: Element, key: string) {
  if (key === 'form') {
    // form表单只读
    return false
  }
  if (key == 'list' && el.tagName === 'INPUT') {
    return false
  }
  return key in el
}
