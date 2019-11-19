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

export function parseHeaders(headers: string): any {
  let parsed = Object.create(null)
  if (!headers) {
    return parsed
  }

  headers.split('\r\n').forEach((line) => {
    let [key, val] = line.split(':')
    key = key.trim().toLowerCase()

    if (!key) {
      return
    }

    if(val) {
      val = val.trim()
    }

    parsed[key] = val
  })

  return parsed
}
