import { getType, checkInString } from './baseFunc'

type TAArr = TArray<any>

function _checkType(obj: any, type: string) {
  const checkFunc = checkInString(type)
  if (checkFunc(obj)) return true
  throw new TypeError('参数类型错误')
}

export function chunk(arr: TAArr, size: number = 1) {
  const newArr: TArray<TAArr> = []
  if (_checkType(arr, 'array')) {
    if (size > 0) {
      for (let j = 0; j < arr.length / size; j++) {
        const subArr: TAArr = []
        newArr.push(subArr)
        for (let i = j * size; i < (j + 1) * size && i < arr.length; i++) {
          subArr.push(arr[i])
        }
      }
    }
  }
  return newArr
}

/**
 * 剔除数组中的假值
 * @param {array<any>} arr
 * @returns {array<any>}
 */
export function compact(arr: TAArr) {
  if (_checkType(arr, 'array')) {
    const newArr: TAArr = []
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (!!item && item !== item) {
        newArr.push(item)
      }
    }
    return newArr
  }
  return arr
}

/**
 * 拼接数组(不修改原数组)
 * @param {any} arrs
 * @returns {array<any>}
 */
export function concat(...arrs: TAArr) {
  const newArr: TAArr = []
  for (let i = 0; i < arrs.length; i++) {
    const item = arrs[i]
    const itemType: string = getType(item)
    if (itemType === 'array') {
      for (let j = 0; j < item.length; j++) {
        newArr.push(item[j])
      }
    } else {
      newArr.push(item)
    }
  }
  return newArr
}

/**
 * 根据传入的第二个数组过滤原数组返回一个新的数组(不改变原数组)
 * @param {Array<any>} arr
 * @param {Array<any>} filterArr
 * @returns {Array<any>}
 */
export function difference(arr: TAArr, filterArr: TAArr) {
  if (_checkType(arr, 'array') && _checkType(filterArr, 'array')) {
    const newArr: TAArr = []
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (!~filterArr.indexOf(arr[i])) {
        newArr.push(item)
      }
    }
    return newArr
  }
  return arr
}

/**
 * 过滤数组,每一项都通过iteratee处理后再匹配(不改变原数组)
 * @param {Array<any>} arr
 * @param {Array<any>} filterArr
 * @param {function} iteratee
 * @returns {Array<any>}
 *
 * todo iteratee提供Object,String,Array匹配支持
 */
export function differenceBy(arr: TAArr, filterArr: TAArr, iteratee: Function) {
  if (_checkType(arr, 'array') && _checkType(filterArr, 'array') && _checkType(iteratee, 'function')) {
    const newArr: TAArr = []
    const _filterArray: TAArr = []
    for (let j = 0; j < filterArr.length; j++) {
      _filterArray.push(iteratee(filterArr[j]))
    }
    for (let i = 0; i < arr.length; i++) {
      const item = iteratee(arr[i])
      if (!~_filterArray.indexOf(item)) {
        newArr.push(arr[i])
      }
    }
    return newArr
  }
  return arr
}

export function differenceWith(arr: TAArr, filterArr: TAArr, comparator: Function) {
  if (_checkType(arr, 'array') && _checkType(filterArr, 'array') && _checkType(comparator, 'function')) {
    const newArr: TAArr = []
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      for (let j = 0; j < filterArr.length; j++) {
        if (comparator(item, filterArr[j])) {
          newArr.push(item)
        }
      }
    }
    return newArr
  }
  return arr
}

/**
 * 创建一个切片数组，去除array前面的n个元素。（n默认值为1。）
 * @param {Array<any>} arr
 * @param {number} skip
 * @returns {Array<any>}
 */
export function drop(arr: TAArr, skip: number = 1) {
  if (_checkType(arr, 'array') && _checkType(skip, 'number')) {
    const newArr = []
    for (let i = skip; i < arr.length; i++) {
      newArr.push(arr[i])
    }
    return newArr
  }
  return arr
}

/**
 * 创建一个切片数组，去除array尾部的n个元素。（n默认值为1。）
 * @param {Array<any>} arr
 * @param {number} skip
 * @returns {Array<any>}
 */
export function dropRight(arr: TAArr, skip: number = 1) {
  if (_checkType(arr, 'array') && _checkType(skip, 'number')) {
    const newArr = []
    for (let i = 0; i < arr.length - skip; i++) {
      newArr.push(arr[i])
    }
    return newArr
  }
  return arr
}

/**
 * 创建一个切片数组，去除array中从 predicate 返回假值开始到尾部的部分。predicate 会传入3个参数： (value, index, array)。
 * @param {Array<any>} arr
 * @param {Function} predicate
 * @returns {Array<any>}
 */
export function dropRightWhile(arr: TAArr, predicate: Function) {
  if (_checkType(arr, 'array') && _checkType(predicate, 'function')) {
    let flag = true
    const newArr = []
    for (let i = 0; i < arr.length; i++) {
      flag = predicate(arr[i], i, arr)
      if (flag) {
        newArr.push(arr[i])
      } else {
        break
      }
    }
    return newArr
  }
  return arr
}

/**
 * 创建一个切片数组，去除array中从起点开始到 predicate 返回假值结束部分。predicate 会传入3个参数： (value, index, array)。
 * @param {Array<any>} arr
 * @param {Function} predicate
 * @returns {Array<any>}
 */
export function dropWhile(arr: TAArr, predicate: Function) {
  if (_checkType(arr, 'array') && _checkType(predicate, 'function')) {
    const newArr = []
    let i = 0
    for (; i < arr.length; i++) {
      const flag = predicate(arr[i], i, arr)
      if (!flag) {
        break
      }
    }
    for (; i < arr.length; i++) {
      newArr.push(arr[i])
    }
    return newArr
  }
  return arr
}

/**
 * 使用 value 值来填充（替换） array，从start位置开始, 到end位置结束（但不包含end位置）。
 * @param {Array<any>} arr
 * @param {any} value
 * @param {number} start
 * @param {number} end
 * @returns {Array<any>}
 */
export function fill(arr: TAArr, value: any, start: number = 0, end = arr.length) {
  if (_checkType(arr, 'array') && _checkType(start, 'number') && _checkType(end, 'number')) {
    for (let i = start; i < end; i++) {
      arr[i] = value
    }
  }
  return arr
}

/**
 * 该方法类似_.find，区别是该方法返回第一个通过 predicate 判断为真值的元素的索引值（index），而不是元素本身。
 * @param {Array<any>} arr
 * @param {Function} predicate
 * @param {number} formIndex
 * @returns {Array<any>}
 *
 * todo predicate 提供Object,String,Array匹配支持
 */
export function findIndex(arr: TAArr, predicate: Function, formIndex: number = 0) {
  if (_checkType(arr, 'array') && _checkType(predicate, 'function') && _checkType(formIndex, 'number')) {
    for (let i = formIndex; i < arr.length; i++) {
      if (predicate(arr[i], i, arr)) {
        return i
      }
    }
  }
  return -1
}

/**
 * 这个方式类似_.findIndex， 区别是它是从右到左的迭代集合array中的元素。
 * @param {Array<any>} arr
 * @param {Function} predicate
 * @param {number} formIndex
 * @returns {Array<any>}
 *
 * todo predicate 提供Object,String,Array匹配支持
 */
export function findLastIndex(arr: TAArr, predicate: Function, formIndex: number = arr.length - 1) {
  if (_checkType(arr, 'array') && _checkType(predicate, 'function') && _checkType(formIndex, 'number')) {
    for (let i = formIndex; i > -1; i--) {
      if (predicate(arr[i], i, arr)) {
        return i
      }
    }
  }
  return -1
}

/**
 * 获取数组 array 的第一个元素。
 * @param {Array<any>} arr
 * @returns {any}
 */
export function head(arr: TAArr) {
  if (_checkType(arr, 'array')) {
    return arr[0]
  }
  return undefined
}

/**
 * 获取数组 array 的第一个元素。
 * @param {Array<any>} arr
 * @returns {any}
 */
export const first = head

/**
 * 减少一级array嵌套深度。
 * @param {Array} arr
 * @returns {Array}
 */
export function flatten(arr: TAArr) {
  if (_checkType(arr, 'array')) {
    const newArr = []
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (getType(item) === 'array') {
        for (let j = 0; j < item.length; j++) {
          newArr.push(item[j])
        }
      }
      newArr.push(item)
    }
    return newArr
  }
  return arr
}

/**
 * 将array递归为一维数组。
 * @param {Array} arr
 * @returns {Array}
 */
export function flattenDeep(arr: TAArr) {
  if (_checkType(arr, 'array')) {
    const newArr: TAArr = []
    const _flat = (arr: TAArr) => {
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        if (getType(item) === 'array') {
          _flat(item)
        } else {
          newArr.push(item)
        }
      }
    }
    _flat(arr)
    return newArr
  }
  return arr
}

/**
 * 根据 depth 递归减少 array 的嵌套层级
 * @param {Array} arr
 * @param {number} depth
 * @returns {Array}
 */
export function flattenDepth(arr: TAArr, depth: number = 1) {
  if (_checkType(arr, 'array')) {
    const newArr: TAArr = []
    const _flat = (arr: TAArr, depth: number) => {
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        if (getType(item) === 'array' && depth > 0) {
          _flat(item, depth - 1)
        } else {
          newArr.push(item)
        }
      }
    }
    _flat(arr, depth)
    return newArr
  }
  return arr
}

/**
 * 与_.toPairs正好相反；这个方法返回一个由键值对pairs构成的对象。
 * @param {Array} pairs
 * @returns {Object}
 */
export function fromPairs(pairs: TArray<TTuple<[string, any]>>) {
  const newObj: IObject<any> = {}
  if (_checkType(pairs, 'array')) {
    for (let i = 0; i < pairs.length; i++) {
      const [key, value] = pairs[i]
      newObj[key] = value
    }
  }
  return newObj
}

/**
 * 使用SameValueZero 等值比较，返回首次 value 在数组array中被找到的 索引值， 如果 fromIndex 为负值，将从数组array尾端索引进行匹配。
 * @param {Array} arr
 * @param {any} value
 * @param {number} formIndex
 * @returns {number}
 */
export function indexOf(arr: TAArr, value: any, formIndex: number = 0) {
  if (_checkType(arr, 'array') && _checkType(formIndex, 'number')) {
    for (let i = formIndex; i < arr.length; i++) {
      const item = arr[i]
      if (item === value) {
        return i
      }
    }
  }
  return -1
}

/**
 * 获取数组array中除了最后一个元素之外的所有元素（注：去除数组array中的最后一个元素）。
 * @param {Array} arr
 * @returns {Array}
 */
export function initial(arr: TAArr) {
  if (_checkType(arr, 'array')) {
    const newArr = []
    for (let i = 0; i < arr.length - 1; i++) {
      newArr.push(arr[i])
    }
    return newArr
  }
  return arr
}
