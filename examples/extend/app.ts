import axios from '../../src/index'

axios({
  method: 'post',
  url: '/extend/post',
  data: {
    msg: 'hi'
  }
})

axios({
  method: 'post',
  url: '/extend/post',
  data: {
    msg: 'hello'
  }
})


axios({
  method: 'post',
  url: '/extend/post',
  data: {
    msg: 'hello'
  }
})

axios.get('/extend/get')

axios.get('/extend/options')

axios.get('/extend/delete')
