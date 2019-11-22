# ts-axios

> 使用 typescript 实现 axios

## 混合对象实现

混合对象实现思路很简单，首先这个对象是一个函数，其次这个对象要包括 `Axios` 类的所有原型属性和实例属性，我们首先来实现一个辅助函数 `extend` 。

```typescript
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}
```

`extend` 方法的实现用到了交叉类型，并且用到了类型断言。`extend` 的最终目的是把 `from` 里的属性都扩展到 `to` 中，包括原型上的属性。

我们接下来对 `axios.ts` 文件做修改，我们用工厂模式去创建一个 `axios` 混合对象。

`axios.ts` ：

```typescript
import { AxiosInstance } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'

function createInstance(): AxiosInstance {
  const context = new Axios()
  const instance = Axios.prototype.request.bind(context)

  extend(instance, context)

  return instance as AxiosInstance
}

const axios = createInstance()

export default axios
```
