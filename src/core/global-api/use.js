/* @flow */

import { toArray } from '../util/index'
// const demo = {
// 	// 参数为对象时，需要提供install方法
//     install: (Vue) => {
//         console.log('自定义插件', Vue);
//         // 定义一些vue中常用的全局方法
//     }
// }

// 为函数

// const common = (Vue) => {
//   console.log('自定义插件', Vue);
//   // 定义一些vue中常用的全局方法
// };


export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 插件是否被安装
    // 之前是给plguin 增加个属性， 现在改版了
    // if (plugin.installed) {
    //   return
    // }
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 参数
    const args = toArray(arguments, 1)
    // 向头部添加this
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      // 改this 为 plugin
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // 参数回调过去
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin) // push 插件 防重复
    return this
  }
}
