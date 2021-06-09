```
最近更新: 2021-05-11
适用版本: 3.3.6
文档地址: https://github.com/elecV2/elecV2P-dei/tree/master/docs/09-webhook.md
```

## 功能

- 获取 JS 列表/运行 JS
- 获取/删除 日志
- 获取服务器相关信息
- 获取定时任务信息
- 开始/暂停 定时任务
- 添加/保存 定时任务
- 远程下载文件到 EFSS
- 执行 shell 指令
- 查看/修改 store/cookie

## 使用

假如服务器地址为: http://192.168.1.102:12521 （后台管理界面的地址，默认端口为 80）

首先访问 webUI(上面的网页地址)-> SETTING，获取 webhook token

webhook 可通过 GET/PUT/POST 三种请求方式触发，下面以几个简单的例子进行说明。

### 运行 JS

GET 方式通过 url 传递相关参数，比如运行 JS，触发的请求链接为：

**http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=runjs&fn=webhook.js**

PUT 或者 POST 以 JSON 的方式传递相关参数, 以在浏览器在使用 fetch 函数为例

``` JS webhook
fetch('http://192.168.1.102:12521/webhook', {   // 本地服务器可直接用 /webhook
  method: 'put',     // or post
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'runjs',
    fn: 'webhook.js'        // 支持远程 JS, 比如：https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/webhook.js
  })
}).then(res=>res.text()).then(s=>console.log(s))
```

- 如果是远程 JS , 会强制下载 JS 文件并保存
- 支持使用 rename 参数，修改远程 JS 下载后的文件名

## body/query 参数

|  type     |   target 目标  |    功能         |        传递参数
| :-------: | -------------- | --------------- | --------------------
| runjs     | fn=webhook.js  | 运行 JS         |  &type=runjs&fn=webhook.js
| status    | 无 ---         | 服务器运行状态  |  &type=status
| task      | 无 ---         | 获取任务列表    |  &type=task
| tasksave  | 无 ---         | 保存任务列表    |  &type=tasksave
| taskinfo  | tid=all or tid | 获取任务信息    |  &type=taskinfo&tid=all
| taskstart | tid=xxtid      | 开始定时任务    |  &type=taskstart&tid=xxxowoxx
| taskstop  | tid=xxtid      | 暂停定时任务    |  &type=taskstop&tid=xxxowoxx
| deletelog | fn=file.js.log | 删除日志文件    |  &type=deletelog&fn=file.js.log
| taskadd   | task: {}       | 添加定时任务    |  { type: 'taskadd', task: {} }
| download  | url=http://xxx | 下载文件到EFSS  |  &type=download&url=https://rawxxxx
| shell     | command=ls     | 执行 shell 指令 |  &type=shell&command=node%20-v
| info      | debug=1  可选  | 查看服务器信息  |  &type=info or &type=info&debug=true
| jslist    | 无 ---         | 获取 JS 列表    |  &type=jslist
| store     | key=cookieKEY  | 获取 cookie 信息|  &type=store&key=cookieKEY
| deljs     | fn=webhook.js  | 删除 JS 文件    |  &type=deljs&fn=webhook.js

- **每次请求注意带上 token**
- **如果使用 PUT/POST 方式，转换为对应的 JSON 格式**
- **command 指令应该先使用 encodeURI 进行编码**
- **shell 执行默认 timeout 为 5000ms（以防出现服务器长时间无响应的问题）**
- **shell 支持附加 cwd 和 timeout 参数**
- **v3.2.6 版本添加 type info**
- **v3.2.9 版本添加 type jslist**
- **v3.3.3 版本添加 type store**

```
# 获取内存使用信息
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=status

# 获取当前所有任务
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=taskinfo&tid=all

# 远程离线下载文件到 EFSS 虚拟目录
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=download&url=https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/overview.png

# 列出 script/Shell 目录下的文件
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=shell&command=ls%20-c%20script/Shell

# shell 使用 cwd 和 timeout 参数
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=shell&command=ls&cwd=script/JSFile&timeout=2000

# 获取 elecV2P 及服务器相关信息
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=info&debug=true

# 通过 webhook 添加定时任务订阅。运行前下载并根据具体情况修改exam-tasksub.js中 suburl 和 webhook 里面的内容 https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/JSTEST/exam-tasksub.js
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=runjs&fn=exam-tasksub.js

# 查看 store/cookie 信息
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=store&op=all          # 获取 cookie 列表
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=store&key=cookieKEY   # 获取某个 KEY 对应值
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=store&op=put&key=cookieKEY&value=webhookgetvalue   # 添加一个 cookie
```

## 使用 PUT/POST 方法

``` JS
// 在 webUI 后台管理页面打开浏览器调试工具，输入以下代码，可不输入服务器地址
// # 添加定时任务 2.4.6 更新
// task 格式参考: https://github.com/elecV2/elecV2P-dei/tree/master/docs/06-task.md

fetch('/webhook', {
  method: 'put',     // or post
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'taskadd',
    task: {
      name: '新的任务-exam',
      type: 'cron',
      job: {
        type: 'runjs',
        target: 'https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/webhook.js',
      },
      time: '10 8 8 * * *',
      running: false        // 是否自动执行添加的任务
    }
  })
}).then(res=>res.text()).then(s=>console.log(s)).catch(e=>console.log(e))

// # 增加/修改 store/cookie (v3.3.3)
fetch('/webhook', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'c2cbbbff-1043-40f4-a4c4-45fc4badfa05',
    type: 'store',
    op: 'put',
    key: 'acookiehook',   // cookie key 关键字
    value: {              // cookie 保存内容。可为 string/number 等其他数据类型
      hello: 'elecV2P'
    },
    options: {            // options 可省略
      type: 'object',     // 指定 value 保存类型，可省略（如省略将根据 value 的类型进行自动判断
      belong: 'webhook.js',        // 指定该 cookie 归属脚本
      note: '一个从 webhook 添加测试 cookie',  // 给 cookie 添加简单备注
    }
  })
}).then(res=>console.log(res.data)).catch(e=>console.log(e))

// 假如 elecV2P 可远程访问，可以使用使用其他任意程序发送网络请求进行调用
```

- webhook 可配合 **telegram bot** 或 **快捷指令** 等其他工具使用，方便快速调用 elecV2P 相关功能
- 通过 webhook 提供的 API，可以自行设计其他 UI 界面，实现与 elecV2P 交互
