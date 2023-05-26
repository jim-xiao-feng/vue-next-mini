import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { isString, isArray, isFunction, isObject } from '@vue/shared'
import { normalizeClass } from 'packages/shared/src/normalizeProp'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

export interface VNode {
  __v_isVNode: true
  type: any
  props: any
  children: any
  shapeFlag: number
  key: any
}

export function isVNode(value) {
  return value ? value.__v_isVNode : false
}

export function createVNode(type, props, children): VNode {
  // 对class、style增强，比如class:{red: true}，转成{class:"red"}
  // 比如class:[{red:true,blue:true}]，转成{class:'red blue'}
  if (props) {
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  // 组合方案 shapeFlag 我想知道一个元素中包含的是多个儿子还是一个儿子 标识
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type) // 组件
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0
  return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(
  type: any,
  props: any,
  children: any,
  shapeFlag: number
) {
  // 虚拟dom,diff算法，跨平台
  const vnode = {
    type,
    props,
    children,
    __v_isVNode: true,
    shapeFlag
  } as VNode

  normalizeChildren(vnode, children)

  return vnode
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0
  const { shapeFlag } = vnode
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN // 16,比如h('div',{},[h('p','p1'),h('p','p2')])
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    // 比如h('div',{},'p1')
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }
  vnode.children = children
  vnode.shapeFlag |= type
}

export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}
