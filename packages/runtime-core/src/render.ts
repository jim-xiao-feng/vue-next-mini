import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Comment, Fragment, Text, isSameVNodeType } from './vnode'
import { EMPTY_OBJ, isString } from '@vue/shared'
import { createComponentInstance, setupComponent } from './component'
import { queuePreFlushCb } from './scheduler'
import { ReactiveEffect } from 'packages/reactivity/src/effect'
import { normalizeVNode, renderComponentRoot } from './componentRenderUtils'

export interface RendererOptions {
  /**
   * 为指定的element的prop打补丁
   */
  patchProp(el: Element, key: string, preValue: any, nextValue: any): void
  /**
   * 为指定的Element设置text
   */
  setElementText(node: Element, text: string): void
  /**
   * 插入指定的el到parent中，anchor表示插入的位置，锚点
   */
  insert(el, parent: Element, anchor?): void
  /**
   * 创建element */
  createElement(type: string)
  remove(el: Element)
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions) {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    remove: hostRemove
  } = options

  const processElement = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 挂载
      mountElement(newVNode, container, anchor)
    } else {
      // 更新
      patchElement(oldVNode, newVNode)
    }
  }

  const mountElement = (vnode, container, anchor) => {
    const { type, props, shapeFlag } = vnode
    // 1. 创建element
    const el = (vnode.el = hostCreateElement(type))
    // 2. 设置children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // children:文本
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, anchor)
    }
    // 3. 设置props
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 4. 插入dom树
    hostInsert(el, container, anchor)
  }

  const mountChildren = (children, container, anchor) => {
    if (isString(children)) {
      children = children.split('')
    }

    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }

  const patchElement = (oldVNode, newVNode) => {
    const el = (newVNode.el = oldVNode.el)

    // 新旧 props
    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    // 更新子节点
    patchChildren(oldVNode, newVNode, el, null)

    // 更新props
    patchProps(el, newVNode, oldProps, newProps)
  }
  const patchChildren = (oldVNode, newVNode, el, anchor) => {
    const c1 = oldVNode && oldVNode.children
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
    const c2 = newVNode && newVNode.children
    const { shapeFlag } = newVNode
    // 文本、空的null、数组

    // 比较两个儿子列表的差异
    // 新的 老的
    // 文本 数组  （删除老儿子，设置文本内容）
    // 文本 文本  （c1 != c2更新文本即可）
    // 数组 数组  （diff算法）
    // 数组 文本  （清空文本，进行挂载）
    // 空   数组  （删除所有儿子）
    // 空   文本  （清空文本）
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 卸载旧子节点
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else {
      // 新的为数组或空
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff算法
          patchKeyedChildren(c1, c2, el, anchor) // 全量比对
        } else {
          // 卸载
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧节点的text
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 单独新子节点的挂载
          //mountChildren(c2, el)
        }
      }
    }
  }

  const patchKeyedChildren = (
    oldChildren,
    newChildren,
    container,
    parentAnchor
  ) => {
    let i = 0
    const newChildrenLength = newChildren.length
    let oldChildrenEnd = oldChildren.length - 1
    let newChildrenEnd = newChildrenLength - 1

    // 1. 自左向右
    while (i < oldChildrenEnd && i <= newChildrenEnd) {
      const oldVNode = oldChildren[i]
      const newVNode = newChildren[i]

      if (isSameVNodeType(oldVNode, newVNode)) {
        patch(oldVNode, newVNode, container, null)
      } else {
        break
      }
      i++
    }

    // 2. 自右向左
    while (i <= oldChildrenEnd && i <= newChildrenEnd) {
      const oldVNode = oldChildren[oldChildrenEnd]
      const newVNode = newChildren[newChildrenEnd]
      if (isSameVNodeType(oldVNode, newVNode)) {
        patch(oldVNode, newVNode, container, null)
      } else {
        break
      }
      oldChildrenEnd--
      newChildrenEnd--
    }

    // 3.新节点 多于 旧节点
    if (i > oldChildrenEnd) {
      if (i <= newChildrenEnd) {
        const nextPos = newChildrenEnd + 1
        const anchor =
          nextPos < newChildrenLength ? newChildren[nextPos].el : parentAnchor
        while (i <= newChildrenEnd) {
          patch(null, normalizeVNode(newChildren[i]), container, anchor)
          i++
        }
      }
    }
    // 4. 旧节点 多余 新节点
    else if (i > newChildrenEnd) {
      while (i <= oldChildrenEnd) {
        unmount(oldChildren[i])
        i++
      }
    }
  }

  const patchProps = (el: Element, vnode, oldProps, newProps) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }
      // 删除掉旧的有，新的没有
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  const processComponent = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountComponent(newVNode, container, anchor)
    }
  }
  const mountComponent = (initialVNode, container, anchor) => {
    initialVNode.component = createComponentInstance(initialVNode)
    const instance = initialVNode.component

    setupComponent(instance) // instance绑定render
    setupRenderEffect(instance, initialVNode, container, anchor) // 渲染组件
  }

  const setupRenderEffect = (instance, initialVNode, container, anchor) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const subTree = (instance.subTree = renderComponentRoot(instance))
        patch(null, subTree, container, anchor)
      } else {
      }
    }

    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => queuePreFlushCb(update)
    ))
    const update = (instance.update = () => effect.run())
  }

  const patch = (oldVNode, newVNode, container, anchor = null) => {
    if (oldVNode == newVNode) {
      return
    }

    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }

    const { type, shapeFlag } = newVNode
    switch (type) {
      case Text:
        break
      case Comment:
        break
      case Fragment:
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(oldVNode, newVNode, container, anchor)
        }
    }
  }

  const unmount = vnode => {
    hostRemove(vnode.el)
  }

  const render = (vnode, container) => {
    if (vnode === null) {
      // 卸载
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode // 存节点为老节点
  }
  return { render }
}
