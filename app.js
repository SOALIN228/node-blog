const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const path = require('path')
const fs = require('fs')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const userRouter = require('./routes/user')
const blogRouter = require('./routes/blog')

const app = express()

// 日志
const ENV = process.env.NODE_ENV
if (ENV !== 'production') { // 开发环境日志打印在控制台
  app.use(logger('dev'))
} else { // 生成环境日志写入文件中
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(logger('combined', {
    stream: writeStream
  }))
}

app.use(express.json()) // 解析json 格式数据
app.use(express.urlencoded({ extended: false })) // 解析非json 格式数据
app.use(cookieParser()) // 解析cookie

const redisClient = require('./db/redis')
const sessionStore = new RedisStore({
  client: redisClient
})
// 配置cookie 和session
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SoaNuo804z_@',
  store: sessionStore,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}))

// 路由
app.use('/api/user', userRouter)
app.use('/api/blog', blogRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
