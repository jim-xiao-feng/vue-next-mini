import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Text, createVNode } from './vnode'

export function renderComponentRoot(instance) {
  const { vnode, render } = instance
  let result
  try {
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      result = normalizeVNode(render!())
    }
  } catch (error) {
    console.error(error)
  }
}

export function normalizeVNode(child) {
  if (typeof child === 'object') {
    return cloneIfMounted(child)
  } else {
    return createVNode(Text, null, String(child))
  }
}

export function cloneIfMounted(child) {
  return child
}
