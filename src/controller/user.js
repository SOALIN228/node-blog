const { exec, escape } = require('../db/mysql')
const { getPassword } = require('../utils/cryp')

const login = (username, password) => {
  // 生成md5加密密码
  password = getPassword(password)

  // 预防sql注入
  username = escape(username)
  password = escape(password)

  const sql = `
    select username, realname from users where username=${username} and password=${password}
  `
  return exec(sql).then(rows => {
    return rows[0] || {}
  })
}

module.exports = {
  login
}
