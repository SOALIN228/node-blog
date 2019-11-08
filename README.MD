# blog
使用原生环境来进行开发，学习node，深入学习前后端流程

## 学习笔记
1. 使用cross-env 区分开分和生产环境
2. 使用nodemon 在修改和报错时自动重启服务
3. 拆分路由，使结构更清晰
4. 逻辑写在controller 中进行解耦，每个模块功能清晰
5. 使用mysql 做数据库操作
6. ```javascript
    res.setHeader('Set-Cookie', `username=${data.username}; path=/; httpOnly; expires=${getCookieExpires()}`)
   ```
   path设置为影响范围为全部路由
   
   httpOnly表示只能由服务端设置
   
   expires设置过期时间
   
