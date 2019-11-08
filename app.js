const querystring = require('querystring')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

const getPostData = (req) => {
  const promise = new Promise((resolve, reject) => {
    if (req.method !== 'POST') { // 非POST 请求不处理
      resolve({})
      return
    }

    if (req.headers['content-type'] !== 'application/json') { // 非json 格式不处理
      resolve({})
      return
    }

    let postData = ''
    req.on('data', chunk => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if (!postData) {
        resolve({})
        return
      }
      resolve(JSON.parse(postData))
    })
  })

  return promise
}

const serverHandle = (req, res) => {
  res.setHeader('Content-type', 'application/json')

  // 获取path
  const url = req.url
  req.path = url.split('?')[0] // 写入req 中

  // 获取query
  req.query = querystring.parse(url.split('?')[1])

  // 处理post data
  getPostData(req).then(postData => {
    req.body = postData

    // blog 路由
    const blogResult = handleBlogRouter(req, res)
    if (blogResult) {
      blogResult.then(blogData => {
        res.end(JSON.stringify(blogData))
      })
      return
    }

    // user 路由
    const userResult = handleUserRouter(req, res)
    if (userResult) {
      userResult.then(userData => {
        res.end(JSON.stringify(userData))
      })
      return
    }

    // 404
    res.writeHead(404, { 'Content-type': 'text/plain' })
    res.write('404 Not Found\n')
    res.end()
  })
}

module.exports = serverHandle
