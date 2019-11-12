## 安装

安装express脚手架

```bash
npm install express-generator -g
```

安装`cross-env` 和 `nodemon`

```bash
npm install cross-env nodemon
```

安装`mysql` 和 `xss`

```bash
npm install mysql xss
```

安装`express-session`

```bash
npm install express-session
```

安装`redis` 和 `connect-redis`

```bash
npm install redis connect-redis
```

## 目录结构

```js
- bin // 启动目录
- config // 配置
	- db.js // 配置mysql 和redis
- controller // 每层路由的逻辑，操作数据库
- db // 操作数据库
- logs // 存放日志
- middleware // 自定义中间件
- model // 控制接口输入输出规范
- routes // 路由
- utils // 工具类
- app.js
```

## 中间件

使用express的中间件可以将通用的方法封装起来，如登录验证，权限验证等，这样在每个中间件中都可以通过`next()`的方式执行，代码非常清晰，方便

中间件的参数可以写多个方法，每个方法都接收`req, res, next`3个参数

```js
function loginCheck (req, res, next) {
  console.log('登录成功')
  next()
}

app.get('/api/xxx', loginCheck, (req, res, next) => {
  console.log('xxx')
  next()
})
```

## 实行简易版express

```js
// like-express.js
const http = require('http')
const slice = Array.prototype.slice

class LikeExpress {
  constructor() {
    // 存放中间件的列表
    this.routes = {
      all: [],   // app.use(...)
      get: [],   // app.get(...)
      post: []   // app.post(...)
    }
  }

  register(path) {
    const info = {}
    if (typeof path === 'string') {
      info.path = path
      // 从第二个参数开始，转换为数组，存入 stack
      info.stack = slice.call(arguments, 1)
    } else {
      info.path = '/'
      // 从第一个参数开始，转换为数组，存入 stack
      info.stack = slice.call(arguments, 0)
    }
    return info
  }

  use() {
    const info = this.register.apply(this, arguments)
    this.routes.all.push(info)
  }

  get() {
    const info = this.register.apply(this, arguments)
    this.routes.get.push(info)
  }

  post() {
    const info = this.register.apply(this, arguments)
    this.routes.post.push(info)
  }

  match(method, url) {
    let stack = []
    if (url === '/favicon.ico') {
      return stack
    }

    // 获取 routes
    let curRoutes = []
    curRoutes = curRoutes.concat(this.routes.all)
    curRoutes = curRoutes.concat(this.routes[method])

    curRoutes.forEach(routeInfo => {
      if (url.indexOf(routeInfo.path) === 0) {
        // url === '/api/get-cookie' 且 routeInfo.path === '/'
        // url === '/api/get-cookie' 且 routeInfo.path === '/api'
        // url === '/api/get-cookie' 且 routeInfo.path === '/api/get-cookie'
        stack = stack.concat(routeInfo.stack)
      }
    })
    return stack
  }

  // 核心的 next 机制
  handle(req, res, stack) {
    const next = () => {
      // 拿到第一个匹配的中间件
      const middleware = stack.shift()
      if (middleware) {
        // 执行中间件函数
        middleware(req, res, next)
      }
    }
    next()
  }

  callback() {
    return (req, res) => {
      res.json = (data) => {
        res.setHeader('Content-type', 'application/json')
        res.end(JSON.stringify(data))
      }
      const url = req.url
      const method = req.method.toLowerCase()

      const resultList = this.match(method, url)
      this.handle(req, res, resultList)
    }
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
}

// 工厂函数
module.exports = () => {
  return new LikeExpress()
}
```

测试代码

```js
const express = require('./like-express')

// 本次 http 请求的实例
const app = express()

app.use((req, res, next) => {
  console.log('请求开始...', req.method, req.url)
  next()
})

app.use((req, res, next) => {
  // 假设在处理 cookie
  console.log('处理 cookie ...')
  req.cookie = {
    userId: 'abc123'
  }
  next()
})

app.use('/api', (req, res, next) => {
  console.log('处理 /api 路由')
  next()
})

app.get('/api', (req, res, next) => {
  console.log('get /api 路由')
  next()
})

// 模拟登录验证
function loginCheck(req, res, next) {
  setTimeout(() => {
    console.log('模拟登陆成功')
    next()
  })
}

app.get('/api/get-cookie', loginCheck, (req, res, next) => {
  console.log('get /api/get-cookie')
  res.json({
    errno: 0,
    data: req.cookie
  })
})

app.listen(8000, () => {
  console.log('server is running on port 8000')
})
```

