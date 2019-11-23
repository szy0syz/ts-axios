import { ResolvedFn, RejectedFn } from './../types/index'

interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

export default class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null>

  constructor() {
    this.interceptors = []
  }

  use(resolved: ResolvedFn<T>, rejected?: RejectedFn) {
    this.interceptors.push({
      resolved,
      rejected
    })
    //* 拦截器的ID就是它在数组中的索引值
    return this.interceptors.length - 1
  }

  forEach(fn: (Interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }

  eject(id: number): void {
    //! 这里有可能刚才已经返回给其他人用了，所以不能删除数组元素，不能改变数组长度
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
