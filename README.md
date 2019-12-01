# ts-axios

> 使用 typescript 实现 axios

## 扩展接口

## 需求分析

为了用户更加方便地使用 axios 发送请求，我们可以为所有支持请求方法扩展一些接口：

- `axios.request(config)`

- `axios.get(url[, config])`

- `axios.delete(url[, config])`

- `axios.head(url[, config])`

- `axios.options(url[, config])`

- `axios.post(url[, data[, config]])`

- `axios.put(url[, data[, config]])`

- `axios.patch(url[, data[, config]])`

如果使用了这些方法，我们就不必在 `config` 中指定 `url`、`method`、`data` 这些属性了。

从需求上来看，`axios` 不再单单是一个方法，更像是一个混合对象，本身是一个方法，又有很多方法属性，接下来我们就来实现这个混合对象。

## 接口类型定义

根据需求分析，混合对象 `axios` 本身是一个函数，我们再实现一个包括它属性方法的类，然后把这个类的原型属性和自身属性再拷贝到 `axios` 上。

我们先来给 `axios` 混合对象定义接口：

`types/index.ts`：

```typescript
export interface Axios {
  request(config: AxiosRequestConfig): AxiosPromise

  get(url: string, config?: AxiosRequestConfig): AxiosPromise

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise

  head(url: string, config?: AxiosRequestConfig): AxiosPromise

  options(url: string, config?: AxiosRequestConfig): AxiosPromise

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
}

export interface AxiosInstance extends Axios {
  (config: AxiosRequestConfig): AxiosPromise
}

export interface AxiosRequestConfig {
  url?: string
  // ...
}

```

首先定义一个 `Axios` 类型接口，它描述了 `Axios` 类中的公共方法，接着定义了 `AxiosInstance` 接口继承 `Axios`，它就是一个混合类型的接口。

另外 `AxiosRequestConfig` 类型接口中的 `url` 属性变成了可选属性。

## 创建 Axios 类

我们创建一个 `Axios` 类，来实现接口定义的公共方法。我们创建了一个 `core` 目录，用来存放发送请求核心流程的代码。我们在 `core` 目录下创建 `Axios.ts` 文件。

`core/Axios.ts`

```typescript
import { AxiosRequestConfig, AxiosPromise, Method } from '../types'
import dispatchRequest from './dispatchRequest'

export default class Axios {
  request(config: AxiosRequestConfig): AxiosPromise {
    return dispatchRequest(config)
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
```

其中 `request` 方法的功能和我们之前的 `axios` 函数功能是一致。`axios` 函数的功能就是发送请求，基于模块化编程的思想，我们把这部分功能抽出一个单独的模块，在 `core` 目录下创建 `dispatchRequest` 方法，把之前 `axios.ts` 的相关代码拷贝过去。另外我们把 `xhr.ts` 文件也迁移到 `core` 目录下。

`core/dispatchRequest.ts`：

```typescript
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL } from '../helpers/url'
import { transformRequest, transformResponse } from '../helpers/data'
import { processHeaders } from '../helpers/headers'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config)
  return xhr(config).then(res => {
    return transformResponseData(res)
  })
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.headers = transformHeaders(config)
  config.data = transformRequestData(config)
}

function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}

function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

function transformHeaders(config: AxiosRequestConfig) {
  const { headers = {}, data } = config
  return processHeaders(headers, data)
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transformResponse(res.data)
  return res
}
```

回到 `Axios.ts` 文件，对于 `get`、`delete`、`head`、`options`、`post`、`patch`、`put` 这些方法，都是对外提供的语法糖，内部都是通过调用 `request` 方法实现发送请求，只不过在调用之前对 `config` 做了一层合并处理。

## 混合对象实现

混合对象实现思路很简单，首先这个对象是一个函数，其次这个对象要包括 `Axios` 类的所有原型属性和实例属性，我们首先来实现一个辅助函数 `extend`。

`helpers/util.ts`

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

`axios.ts`：

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

在 `createInstance` 工厂函数的内部，我们首先实例化了 `Axios` 实例 `context`，接着创建`instance` 指向 `Axios.prototype.request` 方法，并绑定了上下文 `context`；接着通过 `extend` 方法把 `context` 中的原型方法和实例方法全部拷贝到 `instance` 上，这样就实现了一个混合对象：`instance` 本身是一个函数，又拥有了 `Axios` 类的所有原型和实例属性，最终把这个 `instance` 返回。由于这里 `TypeScript` 不能正确推断 `instance` 的类型，我们把它断言成 `AxiosInstance` 类型。

这样我们就可以通过 `createInstance` 工厂函数创建了 `axios`，当直接调用 `axios` 方法就相当于执行了 `Axios` 类的 `request` 方法发送请求，当然我们也可以调用 `axios.get`、`axios.post` 等方法。

## 7.4 重载

调用axios，其实就是调用request方法，所以事先request方法的重载。

因为ts里的特俗运行时，我们只需将需要重载的函数形参类型改 `any` 即可。其实是需要手动类型检查实现重载！

```typescript
  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }
    return dispatchRequest(config)
  }
```

## 8 拦截器

![interceptor](./docs/assets/tx-axios-interceptor.png)

## withCredentials

### 需 求 分 析

有些时候我们会发一些跨域请求，比如 `http://domain-a.com` 站点发送一个 `http://api.domain-b.com/get` 的请求，默认情况下，浏览器会根据同源策略限制这种跨域请求，但是可以通过 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) 技术解决跨域问题。

在同域的情况下，我们发送请求会默认携带当前域下的 cookie，但是在跨域的情况下，默认是不会携带请求域下的 cookie 的，比如 `http://domain-a.com` 站点发送一个 `http://api.domain-b.com/get` 的请求，默认是不会携带 `api.domain-b.com` 域下的 cookie，如果我们想携带（很多情况下是需要的），只需要设置请求的 `xhr` 对象的 `withCredentials` 为 true 即可。

## 代码实现

先修改 `AxiosRequestConfig` 的类型定义。

`types/index.ts`：

```typescript
export interface AxiosRequestConfig {
  // ...
  withCredentials?: boolean
}
```

然后修改请求发送前的逻辑。

`core/xhr.ts`：

```typescript
const { /*...*/ withCredentials } = config

if (withCredentials) {
  request.withCredentials = true
}
```

## demo 编写

在 `examples` 目录下创建 `more` 目录，在 `cancel` 目录下创建 `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>More example</title>
  </head>
  <body>
    <script src="/__build__/more.js"></script>
  </body>
</html>
```

接着创建 `app.ts` 作为入口文件：

```typescript
import axios from '../../src/index'

document.cookie = 'a=b'

axios.get('/more/get').then(res => {
  console.log(res)
})

axios.post('http://127.0.0.1:8088/more/server2', { }, {
  withCredentials: true
}).then(res => {
  console.log(res)
})
```

这次我们除了给 `server.js` 去配置了接口路由，还创建了 `server2.js`，起了一个跨域的服务。

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

const router = express.Router()

const cors = {
  'Access-Control-Allow-Origin': 'http://localhost:8080',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

router.post('/more/server2', function(req, res) {
  res.set(cors)
  res.json(req.cookies)
})

router.options('/more/server2', function(req, res) {
  res.set(cors)
  res.end()
})

app.use(router)

const port = 8088
module.exports = app.listen(port)
```

这里需要安装一下 `cookie-parser` 插件，用于请求发送的 cookie。

通过 demo 演示我们可以发现，对于同域请求，会携带 cookie，而对于跨域请求，只有我们配置了 `withCredentials` 为 true，才会携带 cookie。

至此我们的 `withCredentials` feature 开发完毕，下一节课我们来实现 axios 对 XSRF
 的防御功能。
