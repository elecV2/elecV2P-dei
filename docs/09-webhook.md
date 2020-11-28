```
最近更新： 2020-11-28
适用版本： 2.8.0
```

## 功能

- 运行 JS
- 获取/删除 日志
- 获取服务内存占用信息
- 获取定时任务信息
- 开始/暂停 定时任务
- 添加/保存 定时任务
- 删除 EFSS 中的文件
- 远程下载文件到 EFSS （目前只支持下载 http 协议的远程文件）

## 使用

假如服务器地址为： http://192.168.1.102:12521 （后台管理界面的地址，默认端口为 80。）

首先访问 webUI（上面的网页地址）-> SETTING，获取 webhook token.

webhook 可通过 GET/PUT/POST 三种请求方式触发，下面以几个简单的例子进行说明。

### 运行 JS

GET 方式通过 url 传递相关参数，比如运行 JS，触发的请求链接为：

**http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=runjs&fn=webhook.js**

PUT 或者 POST 以 JSON 的方式传递相关参数, 以在浏览器在使用 fetch 函数为例

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

|  type     |   target 目标  |    功能         |        传递参数
| :-------: | -------------- | --------------- | --------------------
| runjs     | fn=webhook.js  | 运行 JS         |  &type=runjs&fn=webhook.js
| status    | 无 ---         | 服务器运行状态  |  &type=status
| tasksave  | 无 ---         | 保存任务列表    |  &type=tasksave
| taskinfo  | tid=all or tid | 获取任务信息    |  &type=taskinfo&tid=all
| taskstart | tid=xxtid      | 开始定时任务    |  &type=taskstart&tid=xxxowoxx
| taskstop  | tid=xxtid      | 暂停定时任务    |  &type=taskstop&tid=xxxowoxx
| deletelog | fn=file.js.log | 删除日志文件    |  &type=deletelog&fn=file.js.log
| taskadd   | task: {}       | 添加定时任务    |  { type: 'taskadd', task: {} }
| efssdelete  | fn=filename  | 删除EFSS中的文件|  &type=efssdelete&fn=文件名称
| download  | url=http://xxx | 下载文件到EFSS  |  &type=download&url=https://rawxxxx

**每次请求注意带上 token**
**如果使用 PUT/POST 方式，转换为对应的 JSON 格式**

```
# 获取内存使用信息
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=status

# 获取当前所有任务
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=taskinfo&tid=all

# 远程离线下载文件到 EFSS 虚拟目录
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=download&url=https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/overview.png
```

### 添加定时任务 2.4.6 更新

``` JS
// 在后台管理页面打开调试端口，输入代码，可不输入服务器地址
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
}).then(res=>res.text()).then(s=>console.log(s))
```

task 格式参考：https://github.com/elecV2/elecV2P-dei/tree/master/docs/06-task.md