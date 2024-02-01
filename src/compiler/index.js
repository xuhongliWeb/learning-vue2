/* @flow */

import { parse } from './parser/index' // 将HTML字符串转换成AST
import { optimize } from './optimizer' // 优化AST
import { generate } from './codegen/index' // 将AST语法树转化成render
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  debugger
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
