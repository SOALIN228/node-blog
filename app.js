const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const morgan = require('koa-morgan')
const path = require('path')
const fs = require('fs')

const user = require('./routes/user')
const blog = require('./routes/blog')

const { REDIS_CONFIG } = require('./config/db')

// error handler
onerror(app)

// 支持多种传数据格式
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json()) // 返回数据转成json 格式
app.use(logger()) // 格式化控制台打印log

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
