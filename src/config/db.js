const env = process.env.NODE_ENV // 环境参数

let MYSQL_CONFIG

if (env === 'dev') {
  MYSQL_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '717900',
    port: '3306',
    database: 'myblog'
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
}

module.exports = {
  MYSQL_CONFIG
}
