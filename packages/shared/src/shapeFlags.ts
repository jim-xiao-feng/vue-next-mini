// 位运算&| 适合权限的组合
export const enum ShapeFlags { // 标识, | 或运算，有一个1就是1
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1, // 2
  STATEFUL_COMPONENT = 1 << 2, // 4
  TEXT_CHILDREN = 1 << 3, // 8,纯文本
  ARRAY_CHILDREN = 1 << 4, // 16
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPI_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT // 6
}
