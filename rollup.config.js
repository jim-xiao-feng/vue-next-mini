// 编译ts
import typescript from '@rollup/plugin-typescript'

export default [
  {
    // 入口
    input: 'packages/vue/src/index.ts',
    // 出口
    output: [
      {
        // 开启sourceMap
        sourcemap: true,
        // 导出文件地址
        file: './packages/vue/dist/vue.js',
        // 格式
        format: 'iife',
        // 变量名
        name: 'Vue'
      }
    ],
    plugins: [
      typescript({ sourceMap: true })
    ]
  }
]