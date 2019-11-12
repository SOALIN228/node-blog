const env = process.env.NODE_ENV // 环境参数

let MYSQL_CONFIG
let REDIS_CONFIG

if (env === 'development') {
  MYSQL_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '717900',
    port: '3306',
    database: 'myblog'
  }
  REDIS_CONFIG = {
    port: 6379,
    host: '127.0.0.1'
  }
}

if (env === 'production') {
  MYSQL_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '717900',
    port: '3306',
    database: 'myblog'
  }
  REDIS_CONFIG = {
    port: 6379,
    host: '127.0.0.1'
  }
}

module.exports = {
  MYSQL_CONFIG,
  REDIS_CONFIG
}
