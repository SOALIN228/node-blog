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

