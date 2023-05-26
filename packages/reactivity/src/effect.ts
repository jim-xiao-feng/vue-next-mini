import { Dep, createDep } from './dep'
import { extend, isArray } from '@vue/shared'
import { ComputedRefImpl } from './computed'

type KeyToDepMap = Map<any, Dep>
export type EffectScheduler = (...args: any[]) => any
export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
}
const targetMap = new WeakMap<any, KeyToDepMap>()

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn)

  if (options) {
    extend(_effect, options)
  }

  if (!options || !options.lazy) {
    _effect.run()
  }
}

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  public computed?: ComputedRefImpl<T> = undefined
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}
  run() {
    activeEffect = this
    return this.fn()
  }
  stop() {}
}
/**
 * 收集依赖
 * @param target
 * @param key
 */
export function track(target: object, key: unknown) {
  console.log('track: 收集依赖')
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  trackEffects(dep)
}

export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

/**
 * 触发依赖
 * @param target
 * @param key
 * @param value
 */
export function trigger(target: object, key: unknown, value: unknown) {
  console.log('trigger: 触发依赖')
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  const dep = depsMap.get(key)
  if (!dep) {
    return
  }

  triggerEffects(dep)
}

export function triggerEffects(dep: Dep) {
  const effects = isArray(dep) ? dep : [...dep]

  for (const effect of effects) {
    triggerEffect(effect)
  }
}

export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}
