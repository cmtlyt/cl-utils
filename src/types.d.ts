// 空类型
type TEmpty = undefined | null
// 可为空类型
type TSome<T> = Empty | T
// 数组
type TArray<T> = T[]
// 元组
type TTuple<T extends TArray<unknown>> = T
// 对象
interface IObject<T> extends Object {
  [key: string]: T
}
// 查询参数值类型
type TSearchItem = string | boolean | number | object

interface global extends globalThis {
  $fetch: any
}
