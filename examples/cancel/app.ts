import axios, { Canceler } from '../../src/index'

const CancelToken = axios.CancelToken
const source = CancelToken.source()

//* "/cancel/get" 和 "/cancel/post" 服务端都是延迟 1000ms 做响应

axios
  .get('/cancel/get', {
    cancelToken: source.token
  })
  .catch(function(e) {
    if (axios.isCancel(e)) {
      console.log('Request canceled', e.message)
    }
  })

setTimeout(() => {
  source.cancel('Operation canceled by the user.')

  setTimeout(() => {
    axios.post('/cancel/post', { a: 1 }, { cancelToken: source.token }).catch(function(e) {
      if (axios.isCancel(e)) {
        console.log(e.message)
      }
    })
  }, 100)
}, 100)

let cancel: Canceler

axios
  .get('/cancel/get', {
    cancelToken: new CancelToken(c => {
      cancel = c!
    })
  })
  .catch(function(e) {
    if (axios.isCancel(e)) {
      console.log('Request canceled')
    }
  })

setTimeout(() => {
  cancel()
}, 500)
