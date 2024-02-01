import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  // options new Vue 传入的 参数 el, data 等
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof
    // get 小技巧 判断是否为new 调用的 this instanceof Vue
  ) {
    // Vue是一个构造函数，应该用' new '关键字调用
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化 -
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
