// h的用法 h('div')
// h('div', {style: {color: 'red'}})
// h('div', {style: {color: 'red'}}, 'hello')
// h('div', 'hello')
// h('div', h('span'))
// h('div', [h('span'), h('span')])
// h('div', null, 'hello', 'world')
// h('div', null, h('span'))
// h('div', null, [h('span'), h('span')])
// 组件
// const component = {
//   render() {
//     const vnode = h('div', '这是个component')
//     return vnode
//   }
// }
// h(component)
// Text,纯文本
// const vnodeText = h(Text, '这是一个Text')
// Comment,注释
// const vnodeText = h(Comment, '这是一个Text')
// Fragment, 片段

import { isArray, isObject } from '@vue/shared'
import { createVNode, isVNode } from './vnode'

// 创建vnode
export function h(type, propsChildren, children?: any) {
  const l = arguments.length

  // h('div', {style: {color: 'red'}})
  // h('div', 'hello')
  // h('div', h('span'))
  // h('div', [h('span'), h('span')])
  if (l === 2) {
    if (isObject(propsChildren) && !isArray(propsChildren)) {
      if (isVNode(propsChildren)) {
        // h虚拟节点
        return createVNode(type, null, [propsChildren])
      }
      return createVNode(type, propsChildren, []) // 属性
    } else {
      return createVNode(type, null, propsChildren) // 文本或者数组
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVNode(children)) {
      // h('div', null, h('span'))
      children = [children]
    }
    // 其他
    return createVNode(type, propsChildren, children)
  }
}
