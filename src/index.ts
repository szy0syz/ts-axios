import { AxiosRequestConfig } from './types'
import xhr from './xhr'
import { buildURL } from './utils/url'
import { transformRequest } from './utils/data'

function axios(config: AxiosRequestConfig) {
  processConfig(config)
  xhr(config)
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.data = transfromRequestData(config)
}

function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}

function transfromRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

export default axios
