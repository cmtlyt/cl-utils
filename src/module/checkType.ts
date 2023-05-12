import { getType, checkInString } from './baseFunc'

type TCheckValueFunc = (value: any) => boolean

type TRegType = RegExp | string

interface ITypeConfig {
  type: string
  required?: boolean
  nullable?: boolean
  subPropsType?: ITypeConfig
  subProps?: TArray<ITypeConfig>
  key?: string
  regexp?: TArray<TRegType>
}

interface ITypeConfigOption {
  props: TArray<ITypeConfig>
  return?: ITypeConfig
}

interface IGetPropsFunc {
  value: any
  config: ITypeConfig
}

interface ITypeCheckResult {
  result: boolean
  message?: string
  getProps?: () => IGetPropsFunc
}

interface IComplexCheckOptions {
  value: any
  subProps: TArray<ITypeConfig>
  subPropsType?: ITypeConfig
  regexp?: TArray<TRegType>
}

type TComplexCheckType = (options: IComplexCheckOptions) => ITypeCheckResult

const isNaN: TCheckValueFunc = value => {
  return value !== value
}

const isNull: TCheckValueFunc = value => {
  return value === null
}

const isUndefined: TCheckValueFunc = value => {
  return value === undefined
}

const isEmpty: TCheckValueFunc = value => {
  const type: string = getType(value)
  const handleMap: IObject<TCheckValueFunc> = {
    array(value) {
      return !value.length
    },
    string(value) {
      return !value.length
    },
    object(value) {
      return !(Object.getOwnPropertyNames(value).length + Object.getOwnPropertySymbols(value).length)
    },
  }
  return isUndefined(value) || isNull(value) || isNaN(value) || handleMap[type]?.(value) || false
}

function checkValueType(value: unknown, type: string) {
  return type === 'any' ? true : checkInString(type)(getType(value))
}

function checkListPropsTyps(options: IComplexCheckOptions): ITypeCheckResult {
  const { value: list, subProps: configList, subPropsType: allItemType } = options
  let res: ITypeCheckResult = { result: true }
  // 如果存在subProps的话先验证subProps的配置
  if (configList.length) {
    const checkResult = configList.every((config, idx) => {
      res = checkTypeFromConfig(list[idx], config)
      return res.result
    })
    if (!checkResult) return res
  }
  // 如果存在所有项的统一类型的话就对所有类型进行验证
  if (allItemType) {
    const checkResult = (<TArray<any>>list).every(item => {
      res = checkTypeFromConfig(item, allItemType)
      return res.result
    })
    if (!checkResult) return res
  }
  // 如果通过了前面的校验则直接返回校验成功的结果
  return { result: true }
}

function checkObjctPropsType(options: IComplexCheckOptions) {
  const { value: obj, subProps: configList, subPropsType: allItemType } = options
  let res: ITypeCheckResult = { result: true }
  const checkPassKeyList: TArray<string> = []
  const checkResult = configList.every(config => {
    if (!config.key) {
      res.result = false
      return false
    }
    checkPassKeyList.push(config.key)
    res = checkTypeFromConfig(obj[config.key], config)
    return res.result
  })
  if (!checkResult) {
    return res
  }
  if (allItemType) {
    const checkResult = Object.keys(obj).every(key => {
      res = checkTypeFromConfig(obj[key], allItemType)
      return res.result
    })
    if (!checkResult) return res
  }
  return { result: true }
}

function checkStringPropType(options: IComplexCheckOptions): ITypeCheckResult {
  const { value: str, regexp } = options
  let res: ITypeCheckResult = { result: true }
  const checkResult = regexp?.every(reg => {
    const nReg = new RegExp(reg)
    res = { result: false, message: `${str}未通过${nReg.toString()}验证` }
    return nReg.test(str)
  })
  if (!checkResult) {
    return res
  }
  return { result: true }
}

const isSimpleType = checkInString('number,boolean')

function checkIsSimpleType(value: any, config: ITypeConfig): boolean {
  const valueType = getType(value)
  return isSimpleType(valueType) && !config.subProps && !config.regexp
}

function checkTypeFromConfig(value: any, config: ITypeConfig): ITypeCheckResult {
  // 如果nullable不为空,并且为false
  // required为true
  if (
    (!isEmpty(config.nullable) && !config.nullable && isEmpty(value)) ||
    (config.required && isEmpty(value) && !isNaN(value))
  ) {
    return {
      result: false,
      message: `不能为空\nvalue:>${value}\nconfig:${JSON.stringify(config)}`,
      getProps: () => ({ value, config }),
    }
  } else if (config.nullable && isEmpty(value)) {
    return { result: true }
  }
  if (!checkValueType(value, config.type)) {
    return {
      result: false,
      message: `value:>${value}\nconfig:${JSON.stringify(config)}`,
      getProps: () => ({ value, config }),
    }
  }
  if (checkIsSimpleType(value, config)) {
    return {
      result: true,
    }
  }
  return complexCheck(value, config)
}

const checkHandleMap: IObject<TComplexCheckType> = {
  array: checkListPropsTyps,
  object: checkObjctPropsType,
  string: checkStringPropType,
}

function complexCheck(value: any, config: ITypeConfig) {
  const valueType = getType(value)
  const checkHandle = checkHandleMap[valueType]
  if (!checkHandle) {
    console.warn(`暂不支持${valueType}类型数据的复杂验证`)
    return { result: true }
  }
  return checkHandle({
    value,
    subProps: config.subProps || [],
    subPropsType: config.subPropsType,
    regexp: config.regexp,
  })
}

function generateCheckFunc(callback: Function, typeConfig: ITypeConfigOption) {
  return function check(inputProps: TArray<any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const {
        result: typeCheckResult,
        message,
        getProps,
      } = checkListPropsTyps({ value: inputProps, subProps: typeConfig.props })
      if (!typeCheckResult) {
        console.error(message)
        return reject(getProps?.())
      }
      try {
        const callbackResult = await callback(...inputProps)
        // 存在返回值类型校验
        if (typeConfig.return) {
          const {
            result: returnTypeCheckResult,
            message,
            getProps,
          } = checkTypeFromConfig(callbackResult, typeConfig.return)
          if (!returnTypeCheckResult) {
            console.error(message)
            return reject(getProps?.())
          }
        }
        resolve(callbackResult)
      } catch (e) {
        return reject(e)
      }
    })
  }
}

/**
 * 封装函数,使其具有类型校验功能
 * @param {function} callback
 * @param {object} typeConfig
 * @param {object[]} typeConfig.props
 * @param {object?} typeConfig.return
 * @returns {function}
 */
export function useTypeCheckHandle(callback: Function, typeConfig: ITypeConfigOption) {
  const checkFunc = generateCheckFunc(callback, typeConfig)
  return (...args: TArray<any>) => checkFunc(args)
}

function __checkTypeHandle(data: any, typeConfig: TArray<ITypeConfig> | ITypeConfig): Promise<ITypeCheckResult> {
  return new Promise((resolve, reject) => {
    const dataType = getType(data)
    const configType = getType(typeConfig)
    let res: ITypeCheckResult = { result: true }
    const checkHandle = isSimpleType(dataType) ? checkTypeFromConfig : complexCheck
    if (configType === 'array') {
      ;(<TArray<ITypeConfig>>typeConfig).every(config => {
        res = checkHandle(data, config)
        return res.result
      })
    } else {
      res = checkHandle(data, <ITypeConfig>typeConfig)
    }
    if (!res.result) {
      return reject(res)
    }
    return resolve(data)
  })
}

/**
 * 直接检查数据类型
 * @param {any} data
 * @param {TArray<ITypeConfig> | ITypeConfig} typeConfig
 * @returns {Promise}
 */
export function checkTypeHandle(data: any, typeConfig: TArray<ITypeConfig> | ITypeConfig) {
  return __checkTypeHandle(data, typeConfig)
}
