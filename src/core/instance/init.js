/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    // https://v2.cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE
    // Vue.config.performance = true
    // 设置为 true 以在浏览器开发工具的性能/时间线面板中启用对组件初始化、编译、渲染和打补丁的性能追踪。只适用于开发模式和支持 performance.mark API 的浏览器
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 一个防止vm实例自身被观察的标志位
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
        // https://segmentfault.com/a/1190000023648615
        // initGlobalAPI 中的属性合并
        // 选项／资源集合*/
            // export const ASSET_TYPES = [
            //     'component',
            //     'directive',
            //     'filter'
            // ]
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
//   所以extend函数的作用就是返回一个子组件的构造函数，他通过Object.create(), prototype, constructor三者结合实现了子组件对基础Vue组件的继承。我们来看一下具体的流程：

// 通过const Super = this，把Super指向父类，即基础Vue构造函数。
// 定义了子组件的构造函数Sub。当我们new这个子组件时，就会执行这个构造函数Sub，而他最终执行的是this._init(options)。当然，这时候我们的Sub同志还是一个光杆司令，只有原生function对象的属性和方法，当然不会有_init。为了让Sub拥有_init方法，我们就开始了从Super上的继承。
// Sub.prototype = Object.create(Super.prototype)，通过Object.create方法，将Super的原型作为自己原型的__proto__，实现原型继承。这时候，我们的Sub就会拥有Vue基础构造器的所有原型方法，包括Vue.prototype._init。
// 当然，这时候还有个小问题，Sub.prototype.constructor指向的也是Super.prototype.constructor，也就是Vue基础构造函数function Vue()。这时候需要通过Sub.prototype.constructor = Sub把他指向我们子类自己的构造函数function VueComponent()
// 然后通过mergeOption等一系列骚操作完成子组件独有属性的挂载，最后返回了这个子类构造函数Sub。什么？为啥不用继承？当然是为了避免跟全局的污染啊，继承的其实都是公共的属性和方法，像data这种的当然不能通过继承实现。
// 那么，我们心心念念的super属性呢？其实就在这段代码里 Sub['super'] = Super，通过他把Vue基础构造器挂载到了子类构造函数的super属性上了。同时我们也通过Sub.superOptions = Super.options把Vue基础构造器的option选项挂载到了子类构造函数的superOptions属性上。
// 既然找到了super，那么Ctor = baseCtor.extend(Ctor)的这个Ctor中自然会有super属性，因此这时候执行的 resolveConstructorOptions(Ctor)就会走另外一段逻辑：
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
