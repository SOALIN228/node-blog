## 安装

安装koa脚手架

```bash
npm install koa-generator -g
```

安装`cross-env`

```bash
npm install cross-env
```

安装`mysql` 和 `xss`

```bash
npm install mysql xss
```

安装`koa-generic-session` 和`redis`和 `koa-redis`

```bash
npm install koa-generic-session redis koa-redis
```

安装`koa-morgan`

```bash
npm install koa-morgan
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

使用`koa`的中间件可以将通用的方法封装起来，如登录验证，权限验证等，每个中间件都通过`await next()`的方式执行，`koa`和`express`不同在于使用`async`和`await`将每个`promise`的异步代码变为同步，更加简单，容易理解

中间件的参数可以写多个方法，每个方法都接收`ctx, next` 2个参数，`koa`使用`ctx`来代替`express`的`req`和`res`，方便不理解`http`请求和响应的人使用

```js
const { ErrorModel } = require('../model/resModel')

module.exports = async (ctx, next) => {
  if (ctx.session.username) {
    await next()
    return
  }
  ctx.body = new ErrorModel('未登录')
}

const loginCheck = require('../middleware/loginCheck')

router.post('/new', loginCheck, async function (ctx, next) {
  ctx.request.body.author = ctx.session.username
  const data = await newBlog(ctx.request.body)
  ctx.body = new SuccessModel(data)
})
```

## 简易实现koa2

```js
const http = require('http')

// 组合中间件
function compose (middlewareList) {
  return function (ctx) {
    function dispatch (i) {
      const fn = middlewareList[i]
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1))) // 如果用户没有使用promise，也确保最外层有一个promise对象
      } catch (e) {
        return Promise.reject(e)
      }
    }

    return dispatch(0)
  }
}

class LikeKoa2 {
  constructor () {
    this.middlewareList = []
  }

  use (fn) {
    this.middlewareList.push(fn)
    return this
  }

  createContext (req, res) {
    const ctx = {
      req,
      res
    }
    ctx.query = req.query
    return ctx
  }

  handleRequest (ctx, fn) {
    return fn(ctx)
  }

  callback () {
    const fn = compose(this.middlewareList)

    return (req, res) => {
      const ctx = this.createContext(req, res)
      return this.handleRequest(ctx, fn)
    }
  }

  listen (...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
}

module.exports = LikeKoa2
```

```js
const Koa = require('./like-koa2')
const app = new Koa()

// logger
app.use(async (ctx, next) => {
  await next()
  const rt = ctx['X-Response-Time']
  console.log(`${ctx.req.method} ${ctx.req.url} - ${rt}`)
})

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx['X-Response-Time'] = `${ms}ms`
})

// response
app.use(async ctx => {
  ctx.res.end('This is like koa2')
})

app.listen(3000)
```

