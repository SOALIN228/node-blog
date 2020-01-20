# blog
使用原生环境来进行开发，学习node，深入学习前后端流程

## 学习笔记
1. 使用cross-env 区分开分和生产环境

2. 使用nodemon 在修改和报错时自动重启服务

3. 拆分路由，使结构更清晰

4. 逻辑写在controller 中进行解耦，每个模块功能清晰

5. 使用mysql 做数据库操作

6. cookie

    ```javascript
    res.setHeader('Set-Cookie', `username=${data.username}; path=/; httpOnly; expires=${getCookieExpires()}`)
    ```

    `path`设置为影响范围为全部路由

    `httpOnly`表示只能由服务端设置

    `expires`设置过期时间

7. 因为cookie直接存储用户信息不安全，session是服务端根据用户访问产生的一段随机字符串和用户信息进行对应，将随机字符串`userid`起存入cookie中，作为登录凭证，提高安全性

8. 因为直接使用变量来存储session是存在硬盘上，重启服务器会消失，而使用`redis`存储登录凭证速度快，易保存，可扩展性好，按照键值对方式来存储

9. 使用`nginx`做反向代理,前后端联调

8. 文件I/O操作

   ```js
   const fs = require('fs')
   const path = require('path')
   
   const fileName = path.resolve(__dirname, 'data.txt')
   
   // 读文件
   fs.readFile(fileName, (err, data) => {
     if (err) {
       console.error(err)
       return
     }
     console.log(data.toString())
   })
   
   // 写文件
   const content = 'asd\n'
   const opt = {
     flag: 'a' // 追加写入。覆盖为w
   }
   
   fs.writeFile(fileName, content, opt, (err) => {
     if (err) {
       console.error(err)
     }
   })
   
   // 判断文件是否存在
   fs.exists(fileName, exists => {
     console.log(exists)
   })
   ```

9. 普通I/O是一次全部读或全部写，非常吃硬件性能，还要考虑文件大小等问题，所以使用`Stream`可以很好的解决这个问题，`Stream`就像一根管子将要操作的两个事务进行连接，像水流一样进行数据的传输

   ```js
   const fs = require('fs')
   const path = require('path')
   
   const fileName = path.resolve(__dirname, 'data.txt')
   const fileName1 = path.resolve(__dirname, 'data-bak.txt')
   
   const readStream = fs.createReadStream(fileName)
   const writeStream = fs.createWriteStream(fileName1)
   
   readStream.pipe(writeStream) // 读写连接，就是拷贝文件
   
   readStream.on('data', chunk => { // 流的方式进行copy
     console.log(chunk.toString())
   })
   
   readStream.on('end', () => {
     console.log('end')
   })
   ```

12. 将每次访问的记录写入日志中，利用脚本将每天的日志进行拆分，使用`readline` 对每行日志进行读取分析
13. sql注入就是向数据库中写入sql语句，预防办法就是对每次用户输入的信息添加转义，防止用户恶意操作数据库，使用`mysql`的`escape`可以帮我们进行字符的转义
14. xss攻击就是在页面中写入js代码，来获取cookie等信息，预防办法就是将`<, >, &`进行转义，使用`xss`这个库可以很好帮我们解决这个问题
15. 密码使用明文存储非常不安全，使用`node`中的`crypto` 模块帮助我们轻松实现密码加密的功能，用户信息安全性将大幅提高