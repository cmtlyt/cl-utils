/**
 * 获取对象类型
 * @param {object} obj
 * @returns {string}
 */
export function getType(obj: unknown): string {
  const baseType: string = typeof obj
  if (baseType !== 'object') return baseType
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

/**
 * 获取url查询参数
 * @param {string|undefined} key
 * @returns {string|object}
 */
export function parseURI(key?: string): IObject<string> | string {
  const query = location.search.slice(1)
  if (key) {
    const reg = new RegExp(`${key}=(.*?)(&|$)`)
    return decodeURIComponent(reg.exec(query)?.[1] || '')
  }
  const queryMap: IObject<string> = query.split('&').reduce((prev: IObject<string>, curr: string) => {
    const [key, value]: TArray<string> = curr.split('=')
    return (prev[key] = decodeURIComponent(value)), prev
  }, {})
  return queryMap
}

/**
 * 获取普通对象(丐版深克隆)
 * @param {T} obj
 * @returns {T}
 */
export function cloneObj<T>(obj: T): T {
  if (['object', 'array'].includes(getType(obj))) return JSON.parse(JSON.stringify(obj))
  return obj
}

/**
 * 缓存函数执行结果
 * @param {functionm} func
 * @returns {function}
 */
export function cachedFuncResult(func: Function): Function {
  const cacheMap: IObject<string> = {}
  return function (this: unknown, ...args: TArray<unknown>) {
    const key: string = JSON.stringify(args)
    return (cacheMap[key] ??= func.apply(this, args))
  }
}

/**
 * 普通函数转柯里化函数
 * @param {function} func
 * @returns {function}
 */
export function funcCurry(func: Function): Function {
  return function cacheFunc(this: unknown, ...args: TArray<unknown>) {
    if (args.length >= func.length) {
      return func.apply(this, args)
    }
    return function (this: unknown, ...args2: TArray<unknown>) {
      return cacheFunc.apply(this, args.concat(args2))
    }
  }
}

/**
 * 对象转url查询参数
 * @param {object} data
 * @returns {string}
 */
export function encodeParams(data: IObject<unknown>): string {
  const searchList = []
  for (let key in data) {
    // @ts-expect-error
    let value: TSearchItem = data[key]
    if (typeof value === 'object') {
      value = JSON.stringify(value)
    }
    searchList.push(`${key}=${encodeURIComponent(value)}`)
  }
  return '?' + searchList.join('&')
}

/**
 * 对象版forEach
 * @param {object} obj
 * @param {Function} callback
 */
export function forEachObj(
  obj: IObject<unknown>,
  callback: (value?: unknown, key?: string, object?: IObject<unknown>) => void,
) {
  Object.keys(obj).forEach((key: string) => {
    callback(obj[key], key, obj)
  })
}

/**
 * 合并后面多个对象到第一个对象中(浅拷贝)
 * @param {object} target
 * @param {object[]} sourceList
 * @returns {object}
 */
export function objAssign(target: IObject<unknown>, ...sourceList: Array<IObject<unknown>>): IObject<unknown> {
  sourceList.forEach(source => {
    for (let key in source) {
      target[key] = source[key]
    }
  })
  return target
}

/**
 * 判断传入的值是否在预先传入的格式化字符串中
 * @param {string} formatString
 * @param {string} sep ','
 * @returns {Function}
 */
export function checkInString(formatString: string, sep: string = ','): (value: string) => boolean {
  const checkMap = formatString.split(sep)
  return function (value: string): boolean {
    return !!~checkMap.indexOf(value)
  }
}

/**
 * 获取字符串的hash值
 * @param {string} input
 * @returns {string}
 */
export function getHash(input: string = ''): string {
  const I64BIT_TABLE = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let hash = 5381
  for (let i = input.length - 1; i > -1; i--) hash += (hash << 5) + input.charCodeAt(i)
  let value = hash & 0x7fffffff
  let retValue = ''
  do {
    retValue += I64BIT_TABLE.charAt(value & 0x23)
  } while ((value >>= 6))
  return retValue
}

/**
 * 生成uuid格式的随机字符串
 * @returns {string}
 */
export function createUUID(): string {
  const mask = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  return mask.replace(/x/g, () => ((Math.random() * 64) >> 1).toString(32))
}

/**
 * 获取传入的dom元素的Selector选择器
 * @param {Element} $dom
 * @returns {string}
 */
export function getDOMSelector($dom: TSome<Node>): string {
  function __getDomSelector($dom: Node): string {
    const domTag: string = $dom.nodeName.toLowerCase()
    if ($dom instanceof Element) {
      if ($dom.id) {
        return domTag + `#${$dom.id}`
      } else if ($dom.classList.length) {
        return domTag + `.${Array.from($dom.classList).join('.')}`
      }
      const idx: number = [...($dom.parentNode?.children || [])].findIndex(item => item === $dom)
      if (~idx) {
        return `${domTag}:nth-child(${idx + 1})`
      }
      console.warn('当前选择不准确')
      return domTag
    }
    return ''
  }
  function __getSelectors($dom: TSome<Node>, suffix: string = ''): string {
    if (!$dom || ~suffix.indexOf('#')) {
      return suffix
    }
    return __getSelectors($dom.parentElement, `${__getDomSelector($dom)}>${suffix}`)
  }
  return __getSelectors($dom).slice(0, -1)
}

/**
 * 获取传入的dom元素的XPath选择器
 * @param {Element} $dom
 * @returns {string}
 */
export function getDOMXPath($dom: TSome<Node>): string {
  if ($dom instanceof Element) {
    if ($dom.id !== '') {
      return `//*[@id="${$dom.id}"]`
    }
    if ($dom === document.body) {
      return $dom.nodeName
    }
    let ix = 0
    let siblings = $dom.parentNode?.childNodes || []
    for (let i = 0; i < siblings.length; i++) {
      let sibling = siblings[i]
      if (sibling === $dom) {
        return `${getDOMXPath($dom.parentNode)}/${$dom.nodeName}[${ix + 1}]`
      }
      if (sibling.nodeType === 1 && sibling.nodeName === $dom.nodeName) {
        ++ix
      }
    }
    return ''
  }
  return ''
}

/**
 * 扁平化对象
 * @param {object} obj 需要扁平化的对象
 * @param {number} depth 深度
 * @param {string} sep 分隔符
 * @returns {object}
 */
export function flatObj(obj: IObject<unknown>, depth: number, sep: string = '.'): IObject<unknown> {
  const newObj: IObject<unknown> = {}
  const flatFunc = (obj: IObject<unknown>, depth: number, prefix = '') => {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && depth > 0) {
        flatFunc(<IObject<unknown>>obj[key], depth - 1, prefix + key + sep)
      } else {
        newObj[prefix + key] = obj[key]
      }
    }
  }
  flatFunc(obj, depth)
  return newObj
}
