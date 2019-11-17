const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const path = require('path')
const fs = require('fs')
const morgan = require('koa-morgan')

const user = require('./routes/user')
const blog = require('./routes/blog')

const { REDIS_CONFIG } = require('./config/db')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({ // 支持多种传数据格式
  enableTypes:['json', 'form', 'text']
}))
app.use(json()) // 返回数据转成json 格式
app.use(logger()) // 日志
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger 设置控制台打印格式
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// logs 日志
const ENV = process.env.NODE_ENV
if (ENV !== 'production') { // 开发环境日志打印在控制台
  app.use(morgan('dev'))
} else { // 生成环境日志写入文件中
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(morgan('combined', {
    stream: writeStream
  }))
}

// session 配置
app.keys = ['SOALin28@_.']
app.use(session({
  // cookie
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  // redis
  store: redisStore({
    all: `${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`
  })
}))

// routes
app.use(user.routes(), user.allowedMethods())
app.use(blog.routes(), blog.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
