import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL } from '../utils/url'
import { flattenHeaders } from '../utils/headers'
import transform from './transform'
import { config } from 'shelljs'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  //* 发送请求前，检查是否有cancelToken，如果之前使用token取消过有就抛异常，不发送请求
  thtowIfCalcellationRequested(config)
  processConfig(config)
  return xhr(config).then(res => {
    return transfromResponseData(res)
  })
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  //* 必须先处理headers
  // config.headers = transformHeaders(config)
  // config.data = transfromRequestData(config)
  config.data = transform(config.data, config.headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!)
}

function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url!, params)
}

// function transfromRequestData(config: AxiosRequestConfig): any {
//   return transformRequest(config.data)
// }

// function transformHeaders(config: AxiosRequestConfig): any {
//   // 这里headers默认为空对象，则post时默认Content-Type: application/json
//   const { headers = {}, data } = config
//   return processHeaders(headers, data)
// }

function transfromResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

function thtowIfCalcellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.thtowIfRequested()
  }
}
