import { AxiosRequestConfig, AxiosPromise } from './types'
import xhr from './xhr'
import { buildURL } from './utils/url'
import { transformRequest } from './utils/data'
import { processHeaders } from './utils/headers'

function axios(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config)
  return xhr(config)
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  //* 必须先处理headers
  config.headers = transformHeaders(config)
  config.data = transfromRequestData(config)
}

function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}

function transfromRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

function transformHeaders(config: AxiosRequestConfig): any {
  //* 这里headers默认为空对象，则post时默认Content-Type: application/json
  const { headers = {}, data } = config
  return processHeaders(headers, data)
}

export default axios
