### 类型检查主要函数声明

```typescript
interface ITypeConfig {
  type: string
  required?: boolean
  nullable?: boolean
  subPropsType?: ITypeConfig
  subProps?: ITypeConfig[]
  key?: string
  regexp?: TRegType[]
}

interface ITypeConfigOption {
  props: ITypeConfig[]
  return?: ITypeConfig
}

/**
 *
 * @param {Function} callback
 * @param {ITypeConfigOption} typeConfig
 * @returns {(...args) => Promise<any>}
 */
useTypeCheckHandle(callback, typeConfig)
/**
 * 直接检查数据类型
 * @param {T} data
 * @param {ITypeConfig[] | ITypeConfig} typeConfig
 * @returns {Promise<T>}
 */
checkTypeHandle(data, typeConfig)
```

### 0.3.11

- 新增字符串正则验证
- 修改 `useCheckType` 函数为`useTypeCheckHandle`
- 新增 `checkTypeHandle` 用于直接检查数据类型

### 0.3.8

- 对象类型支持对所有字段进行统一类型判断

### 0.3.7

- 复合类型 复杂检查 失败问题修复

### 0.3.6

- 增加多类型检查及 any 类型

```javascript
function test(id) {
  return id
}
useCheckType(test, { props: [{ type: any }], return: { type: 'string,object' } })
```

### 0.3.5

- 增加异步方法支持

### 0.3.4

- 修改 package.json 脚本
- 新增 package.json module 字段

### 0.3.0

添加了`useCheckType`方法 - 用于对函数的入参和出参进行类型检查

```javascript
function test(obj, num, str, bool, arr) {
  return {}
}

useCheckType(test, {
  props: [
    {
      type: 'object',
      subProps: [
        { key: 'name', type: 'string' },
        { key: 'age', type: 'number' },
        { key: 'hasDel', type: 'boolean' },
        {
          key: 'other',
          type: 'object',
          required: false,
          nullable: true,
          subProps: [
            { key: 'othre_num', type: 'number' },
            { key: 'other_string', type: 'string' },
            { key: 'other_boolean', type: 'boolean' },
            { key: 'other_arr', type: 'array', subPropsType: { type: 'string' } },
          ],
        },
      ],
    },
    {
      type: 'number',
    },
    {
      type: 'string',
    },
    {
      type: 'boolean',
    },
    {
      type: 'array',
      subProps: [
        { type: 'number' },
        { type: 'string', nullable: true },
        { type: 'boolean' },
        {
          type: 'object',
          subProps: [
            { key: 'arr_n', type: 'number', nullable: false },
            { key: 'arr_s', type: 'string', nullable: true },
            { key: 'arr_NaN', type: 'number', nullable: true },
          ],
        },
      ],
    },
  ],
  return: {
    type: 'object',
  },
})(
  {
    name: '123',
    age: 1,
    hasDel: true,
  },
  1,
  'a',
  true,
  [1, '', true, { arr_n: 123, arr_s: '', arr_NaN: NaN }],
)
```
