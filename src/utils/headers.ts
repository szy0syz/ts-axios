import { isPlainObject } from '../utils/util'

function normalizeHeaderName(headers: any, nromalizedName: string): void {
  if (!headers) {
    return
  }
  //* 支持 content-type 的值转存 Content-Type 国标
  Object.keys(headers).forEach(name => {
    if (name !== nromalizedName && name.toUpperCase() === nromalizedName.toUpperCase()) {
      headers[nromalizedName] = headers[name]
      delete headers[name]
    }
  })
}

export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')

  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }

  return headers
}
