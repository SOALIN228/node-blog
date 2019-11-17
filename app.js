const querystring = require('querystring')
const { get, set } = require('./src/db/redis')
const { access } = require('./src/utils/log')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

// const SESSION_DATA = {}

// 获取cookie 过期时间
const getCookieExpires = () => {
  const d = new Date()
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
  return d.toGMTString()
}

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
  // 记录access log
  console.log(`${req.method} -- ${req.url} -- ${req.headers['user-agent']}`)

  res.setHeader('Content-type', 'application/json')

  // 获取path
  const url = req.url
  req.path = url.split('?')[0] // 写入req 中

  // 获取query
  req.query = querystring.parse(url.split('?')[1])

  // 处理cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || ''
  cookieStr.split(';').forEach(item => {
    if (!item) return
    const arr = item.split('=')
    const key = arr[0].trim()
    const value = arr[1]
    req.cookie[key] = value
  })

  // 解析session
  // let needSetCookie = false
  // let userId = req.cookie.userid
  // if (userId) {
  //   if (!SESSION_DATA[userId]) { // 初始化
  //     SESSION_DATA[userId] = {}
  //   }
  // } else {
  //   needSetCookie = true
  //   userId = `${Date.now()}_${Math.random()}`
  //   SESSION_DATA[userId] = {}
  // }
  // req.session = SESSION_DATA[userId]

  // 解析session redis
  let needSetCookie = false
  let userId = req.cookie.userid
  if (!userId) {
    needSetCookie = true
    userId = `${Date.now()}_${Math.random()}`
    set(userId, {})
  }
  req.sessionId = userId
  get(req.sessionId).then(sessionData => {
    if (sessionData === null) {
      set(req.sessionId, {})
      req.session = {}
    } else {
      req.session = sessionData
    }

    // 处理post data
    return getPostData(req)
  }).then(postData => {
    req.body = postData

    // blog 路由
    const blogResult = handleBlogRouter(req, res)
    if (blogResult) {
      blogResult.then(blogData => {
        if (needSetCookie) {
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        }
        res.end(JSON.stringify(blogData))
      })
      return
    }

    // user 路由
    const userResult = handleUserRouter(req, res)
    if (userResult) {
      userResult.then(userData => {
        if (needSetCookie) {
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        }
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
