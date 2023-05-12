//! 升级版对象
//! 数组方法迁移到对象上
type TForFunc = (callback: Function, thisArgs?: unknown) => IObject<unknown> | unknown

type TFuncMap = IObject<TForFunc | Function>

/**
 * 升级对象
 * @param {object} obj
 */
export function upgradeObj(obj: IObject<unknown>) {
  const funcMap: TFuncMap = {
    forEach(callback, thisArgs) {
      const keys: string[] = Object.keys(this)
      keys.forEach(key => {
        callback.apply(thisArgs || this, [this[key], key, this])
      })
    },
    map(callback, thisArgs) {
      const keys: string[] = Object.keys(this)
      const list = []
      for (let i = 0; i < keys.length; i++) {
        list.push(callback.apply(thisArgs || this, [this[keys[i]], keys[i], this]))
      }
      return list
    },
    some(callback, thisArgs) {
      const keys: string[] = Object.keys(this)
      for (let i = 0; i < keys.length; i++) {
        if (callback.apply(thisArgs || this, [this[keys[i]], keys[i], this])) return true
      }
      return false
    },
    every(callback, thisArgs) {
      const keys: string[] = Object.keys(this)
      for (let i = 0; i < keys.length; i++) {
        if (!callback.apply(thisArgs || this, [this[keys[i]], keys[i], this])) return false
      }
      return true
    },
    find(callback, thisArgs) {
      const keys: string[] = Object.keys(this)
      for (let i = 0; i < keys.length; i++) {
        if (callback.apply(thisArgs || this, [this[keys[i]], keys[i], this])) return this[keys[i]]
      }
      return null
    },
    filter(callback, thisArgs) {
      const keys: string[] = Object.keys(this)
      const newObj: IObject<unknown> = {}
      for (let i = 0; i < keys.length; i++) {
        if (callback.apply(thisArgs || this, [this[keys[i]], keys[i], this])) newObj[keys[i]] = this[keys[i]]
      }
      return newObj
    },
    flat(depth: number): IObject<unknown> {
      const newObj: IObject<unknown> = {}
      const flatFunc = (obj: IObject<unknown>, depth: number, prefix = '') => {
        for (let key in obj) {
          if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && depth > 0) {
            flatFunc(<IObject<unknown>>obj[key], depth - 1, prefix + key + '.')
          } else {
            newObj[prefix + key] = obj[key]
          }
        }
      }
      const obj: IObject<unknown> = this
      flatFunc(obj, depth)
      return newObj
    },
    remove(keys: string | string[]) {
      if (typeof keys === 'string') {
        keys = [keys]
      }
      if (!Array.isArray(keys)) {
        console.error('key必须是字符串数组或字符串')
      }
      return this.filter((_: unknown, key: string): boolean => {
        return !keys.includes(key)
      })
    },
  }
  for (let key in funcMap) {
    Object.defineProperty(obj, key, {
      value: funcMap[key],
      writable: false,
      enumerable: false,
      configurable: false,
    })
  }
}
