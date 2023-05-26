import { extend } from '@vue/shared'
import { createRenderer } from 'packages/runtime-core/src/render'
import { patchProp } from './patchProp'
import { nodeOps } from './nodeOps'

const rendererOptions = extend({ patchProp }, nodeOps)
let renderer
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

export const render = (...args) => {
  ensureRenderer().render(...args)
}
