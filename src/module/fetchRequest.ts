// 基于fetch封装请求对象
import { encodeParams } from './baseFunc'

type TRequestHandle = (...args: unknown[]) => ISendRequestOption
type TResponseHandle = (...args: unknown[]) => unknown
interface IQueryConfig extends RequestInit {
  params?: IObject<unknown>
  data?: IObject<unknown>
  skipCached?: Boolean
  cacheData?: Boolean
  beforeRequest?: TRequestHandle
  afterRequest?: TResponseHandle
}
export interface IInitRequestConfig extends RequestInit {
  cacheGet?: Boolean
}
enum EMethods {
  Get,
  Post,
  Put,
  Delete,
}
interface ISendRequestOption {
  url: string
  method: EMethods
  config: IQueryConfig
  beforeRequest?: TRequestHandle
  afterRequest?: TResponseHandle
}
const methodMap = {
  [EMethods.Get]: 'get',
  [EMethods.Post]: 'post',
  [EMethods.Put]: 'put',
  [EMethods.Delete]: 'delete',
}

const instanceMap: IObject<FetchRequest> = {}

class FetchRequest {
  private requester: (url: string, config: RequestInit) => Promise<unknown>
  constructor(config: IInitRequestConfig) {
    this.requester = this.genRequest(config)
  }
  get intercept() {
    return {
      get request() {
        const handle: TArray<TRequestHandle> = []
        return {
          handle,
          use(...func: TArray<TRequestHandle>) {
            handle.push(...func.flat(Infinity))
          },
        }
      },
      get response() {
        const handle: TArray<TResponseHandle> = []
        return {
          handle,
          use(...func: TArray<TResponseHandle>) {
            handle.push(...func.flat(Infinity))
          },
        }
      },
    }
  }
  private cacheMap: IObject<unknown> = {}
  genRequest(config: IInitRequestConfig) {
    let { cacheGet, ...defalutConfig } = config
    return (url: string, config_: IQueryConfig) => {
      return new Promise((resolve, reject) => {
        const { cacheData, skipCached, ...currentConfig } = config_
        const { body } = currentConfig
        const hasCache = !skipCached && (cacheData || (cacheGet && currentConfig.method?.toLowerCase() === 'get'))
        if (hasCache) {
          const key = url + body
          const cacheData = this.cacheMap[key]
          if (cacheData) {
            return Promise.resolve(cacheData)
          }
        }
        const defalutConfig_ = Object.create(defalutConfig)
        fetch(url, Object.assign(defalutConfig_, currentConfig))
          .then(res => {
            const pres = res.json()
            if (hasCache) {
              pres.then(res => {
                this.cacheMap[url + body] = res
              })
            }
            resolve(pres)
          })
          .catch(reject)
      })
    }
  }
  request(option: ISendRequestOption) {
    option = this.intercept.request.handle.reduce((prev, handle) => handle(prev), option)
    option = option.beforeRequest?.() || option
    let {
      url,
      method,
      config: { data, params, ...otherConfig },
    } = option
    otherConfig.method = methodMap[method]
    if (method === EMethods.Post || method === EMethods.Put) {
      otherConfig.body = JSON.stringify(data)
    }
    if (params) {
      url += encodeParams(params)
    }
    return new Promise((resolve, reject) => {
      this.requester(url, otherConfig)
        .then(res => {
          res = this.intercept.response.handle.reduce((prev, handle) => handle(prev), res)
          resolve(option.afterRequest?.() || res)
        })
        .catch(reject)
    })
  }
  get(url: string, config: IQueryConfig) {
    return this.request({ method: EMethods.Get, url, config })
  }
  post(url: string, data: IObject<unknown>, config: IQueryConfig) {
    return this.request({ method: EMethods.Post, url, config: { data, ...config } })
  }
  put(url: string, data: IObject<unknown>, config: IQueryConfig) {
    return this.request({ method: EMethods.Put, url, config: { data, ...config } })
  }
  delete(url: string, config: IQueryConfig) {
    return this.request({ method: EMethods.Delete, url, config })
  }
}

export interface IFetchRequest extends FetchRequest {}

/**
 * 创建一个实例
 * @param {IInitRequestConfig} config
 * @param {string} name
 * @returns {FetchRequest}
 */
export function createInstance(config: IInitRequestConfig, name: string = '_defalut'): FetchRequest {
  return (instanceMap[name] ??= new FetchRequest(config))
}

export default createInstance({})
