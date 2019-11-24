import { AxiosTransformer } from './../types/index'

// export default function(
//   data: any,
//   headers: any,
//   fns?: AxiosTransformer | AxiosTransformer[]
// ): any {
//   if (!fns) {
//     return data
//   }

//   //* 不是数组默认成数组，后面统一遍历逻辑
//   if (!Array.isArray(fns)) {
//     fns = [fns]
//   }
//   //* 管道执行转换函数
//   fns.forEach(fn => {
//     data = fn(data, headers)
//   })

//   return data
// }

export default function transform(
  data: any,
  headers: any,
  fns?: AxiosTransformer | AxiosTransformer[]
): any {
  if (!fns) {
    return data
  }
  if (!Array.isArray(fns)) {
    fns = [fns]
  }
  fns.forEach(fn => {
    data = fn(data, headers)
  })
  return data
}
