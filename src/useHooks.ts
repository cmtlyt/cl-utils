import * as baseFunc from './module/baseFunc'
import _fetchRequest, { createInstance, IInitRequestConfig } from './module/fetchRequest'

function forEachObj(obj: IObject<unknown>, callback: (value: unknown, key: string, object: IObject<unknown>) => void) {
  Object.keys(obj).forEach((key: string) => {
    callback(obj[key], key, obj)
  })
}

function setKeyReadonly(obj: any, key: string, value: any) {
  Object.defineProperty(obj, key, {
    value,
    writable: false,
    enumerable: false,
    configurable: false,
  })
}

type TUseFuncReturnValue = TSome<object>

interface IUseBaseOptions {
  toRoot?: boolean
  target?: any
}

interface IFetchOptions extends IUseBaseOptions {
  config: IInitRequestConfig
  name?: string
}

/**
 * 混入baseFunc工具函数
 * @param {object} options
 * @param {boolean} options.toRoot
 * @param {any} options.target
 * @returns {undefined|object}
 */
export function useBaseFunc({ toRoot, target }: IUseBaseOptions): TUseFuncReturnValue {
  const mixin = function (obj: IObject<unknown>, tar: any) {
    tar = tar.prototype || tar
    forEachObj(obj, function (value, key) {
      setKeyReadonly(target, '$' + key, value)
    })
  }
  if (target) mixin(baseFunc, target)
  else if (toRoot) mixin(baseFunc, global)
  else {
    return {
      install(vm: any) {
        mixin(baseFunc, vm.prototype)
      },
    }
  }
}

/**
 * 混入fetch
 * @param {object} param0
 * @param {IInitRequestConfig} param0.config
 * @param {boolean} param0.toRoot
 * @returns {undefined|object}
 */
export function useFetch(
  { config, toRoot, name }: IFetchOptions = { config: {}, name: '_custom' },
): TUseFuncReturnValue {
  if (toRoot) {
    setKeyReadonly(global, '$fetch', createInstance(config, name))
  } else {
    return {
      install(vm: any) {
        setKeyReadonly(vm.prototype, '$fetch', createInstance(config, name))
      },
    }
  }
}
