```
最近更新： 2020-8-22
适用版本： 2.4.6
```

## 功能

- 运行 JS
- 删除 日志
- 获取运行状态 status
- 获取定时任务信息
- 开始/暂停 定时任务
- 添加定时任务

## 使用

假如网页地址为： http://192.168.1.102:12521

首先访问 webUI -> setting，获取 webhook token.

webhook 可通过 GET/PUT/POST 三种请求方式触发。

### 运行 JS

GET 方式通过 url 传递相关参数，比如运行 JS，直接访问以下链接即可

** http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=runjs&fn=webhook.js **

PUT 或者 POST, 以 fetch 函数为例

``` JS webhook
fetch('http://192.168.1.102:12521/webhook', {
  method: 'put',     // or post
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'runjs',
    fn: 'webhook.js'        // 支持远程 JS, 比如：https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/webhook.js。
  })
}).then(res=>res.text()).then(s=>console.log(s))
```

- 如果是远程 JS 会强制下载
- 支持使用 rename 参数，修改远程 JS 下载后的文件名

## body/query 参数

|  type     |   target 目标  |    功能         |        结果
| :-------: | -------------- | --------------- | --------------------
| runjs     | fn=webhook.js  | 运行 JS         |  &type=runjs&fn=webhook.js
| status    | 无 ---         | 服务器运行状态  |  &type=status
| taskinfo  | tid=all or tid | 定时任务信息    |  &type=taskinfo&tid=all
| taskstart | tid=xxtid      | 开始定时任务    |  &type=taskstart&tid=xxxowoxx
| taskstop  | tid=xxtid      | 暂停定时任务    |  &type=taskstop&tid=xxxowoxx
| deletelog | fn=file.js.log | 删除日志文件    |  &type=deletelog&fn=file.js.log
| taskadd   | task: {}       | 添加定时任务    |  { type: 'taskadd', task: {} }

**每次请求注意带上 token**
**如果使用 PUT/POST 方式，转换为对应的 JSON 格式**

### 添加定时任务 2.4.6 更新

``` js
fetch('http://192.168.1.102:12521/webhook', {
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
}).then(res=>res.text()).then(s=>console.log(s))
```

task 格式参考：https://github.com/elecV2/elecV2P-dei/tree/master/docs/06-task.md