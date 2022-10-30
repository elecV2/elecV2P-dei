```
最近更新: 2022-10-30
适用版本: 3.7.4
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/09-webhook.md
```

webhook 用于使用一个网络请求来调用 elecV2P 的部分功能

## 可调用功能列表

- 获取脚本列表/运行脚本
- 获取/删除 日志
- 获取服务器相关信息
- 获取定时任务信息
- 开始/暂停 定时任务
- 添加/保存 定时任务
- 远程下载文件到 EFSS
- 执行 shell 指令
- 查看/修改 store/cookie(v3.3.3)
- 脚本文件获取/新增(v3.4.0)
- IP 限制 黑白名单更新(v3.4.0)
- 打开/关闭代理端口(v3.4.8)
- 全局 CORS 设置(v3.5.4-v3.7.3, v3.7.4 后移除)
- 使用根证书签发任意域名证书(v3.5.8)

## 使用

首先在 webUI-> SETTING/设置相关中获取 WEBHOOK TOKEN，然后可通过 GET/PUT/POST 三种请求方式触发相关功能。

下面以几个简单的例子进行说明。

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
    fn: 'webhook.js'
  })
}).then(res=>res.text()).then(s=>console.log(s))

fetch('/webhook', {   // 本地服务器可直接用 /webhook
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'runjs',
    fn: 'https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/exam-js-env.js',        // 支持远程 JS
    env: {   // (v3.4.5 支持添加临时环境变量)
      name: 'webhook',
      cookie: '来自 webhook 的临时环境变量'
    },
    grant: 'nodejs',   // (v3.4.5 增加支持 grant，多个 grant 用英文竖线符(|)隔开。具体功能参考 04-JS.md @grant 相关部分)
  })
}).then(res=>res.text()).then(s=>console.log(s))
```

- 如果是远程脚本, 会强制下载脚本文件并保存
- 支持使用 rename 参数，修改远程脚本下载后的文件名

## body/query 参数说明

|  type     |   target 目标  |    功能         |        传递参数
| :-------: | -------------- | --------------- | --------------------
| runjs     | fn=webhook.js  | 运行脚本        |  &type=runjs&fn=webhook.js
| status    | 无 ---         | 服务器运行状态  |  &type=status
| task      | 无 ---         | 获取任务列表    |  &type=task
| tasksave  | 无 ---         | 保存任务列表    |  &type=tasksave
| taskinfo  | tid=all or tid | 获取任务信息    |  &type=taskinfo&tid=all
| taskstart | tid=xxtid      | 开始定时任务    |  &type=taskstart&tid=xxxowoxx
| taskstop  | tid=xxtid      | 暂停定时任务    |  &type=taskstop&tid=xxxowoxx
| getlog    | fn=xxxxxxx.log | 查看日志文件    |  &type=getlog&fn=xxxxxxx.log
| deletelog | fn=file.js.log | 删除日志文件    |  &type=deletelog&fn=file.js.log
| taskadd   | task: {}       | 添加定时任务    |  { type: 'taskadd', task: {}, options: {} }
| download  | url=http://xxx | 下载文件到EFSS  |  &type=download&url=https://rawxxxx
| shell     | command=ls     | 执行 shell 指令 |  &type=shell&command=node%20-v
| info      | debug=1  可选  | 查看服务器信息  |  &type=info or &type=info&debug=true
| jslist    | 无 ---         | 获取脚本列表    |  &type=jslist
| store     | key=cookieKEY  | 获取 cookie 信息|  &type=store&key=cookieKEY
| deljs     | fn=webhook.js  | 删除脚本文件    |  &type=deljs&fn=webhook.js
| jsfile    | fn=test.js     | 获取脚本内容    |  &type=jsfile&fn=test.js
| security  | op=put&enable. | 后台 IP 限制修改|  &type=security
| proxyport | op=open/close  | 打开/关闭代理   |  &type=proxyport&op=open
| blackreset| 无 ---         | 重置非法IP 记录 |  &type=blackreset
| newcrt    | hostname=xx.xx | 签发域名证书    |  &type=newcrt&hostname=myhost.com

- **每次请求时注意带上 token**
- **如果使用 PUT/POST 方式，body 应为对应的 JSON 格式**
- **command 指令需先使用 encodeURI 进行编码**
- **shell 执行默认 timeout 为 5000ms（以防出现服务器长时间无响应的问题）**

- (v3.7.1 更新) 当 type 参数缺省，或对应参数不在列表中时，可使用脚本处理 payload（即 request body）。需在 webUI->SETTING 设置界面启用 WEBHOOK SCRIPT。此种方式触发的脚本，通过 **$env.payload** 变量来获取除 token 以外的所有 body 参数

- (具体使用方法，参考下面的相关示例)

## 直接 GET 请求

```
# 获取内存使用信息
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=status

# 获取当前所有任务
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=taskinfo&tid=all

# 远程离线下载文件到 EFSS 虚拟目录
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=download&url=https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/overview.png

## 自定义下载文件保存目录和名称(v3.4.0)
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=download&url=https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/JSTEST/evui-dou.js&folder=script/JSFile&name=edou.js

# 列出 script/Shell 目录下的文件
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=shell&command=ls%20-cwd%20script/Shell

## shell 使用 cwd 和 timeout 参数
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=shell&command=ls&cwd=script/JSFile&timeout=2000

# 获取 elecV2P 及服务器相关信息
http://192.168.1.102:12521/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=info&debug=true

# 查看 store/cookie 信息
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=store&op=all          # 获取 cookie 列表
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=store&key=cookieKEY   # 获取某个 KEY 对应值
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=store&op=put&key=cookieKEY&value=webhookgetvalue   # 添加一个 cookie

# 后台 IP 限制查看/修改
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=security              # 查看当前 SECURITY 设置

## 修改后台 IP 限制。关键参数 op=put，其他修改参数 enable, blacklist, whitelist 可只设置一项，list 中多个数据用逗号(,)分开。
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=security&op=put&enable=true&blacklist=*&whitelist=127.0.0.1,192.168.1.1

## 关闭仅开放 webhook 接口选项(v3.6.4)
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=security&op=put&webhook_only=false

# 删除默认脚本文件夹下的所有非脚本文件(v3.4.2)
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=deljs&op=clear

# 重置非法访问的 IP 记录(v3.5.5)
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=blackreset

# 使用根证书签发任意域名证书(v3.5.8)
# 生成的域名证书位于 当前项目/rootCA 目录下
http://127.0.0.1/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3&type=newcrt&hostname=v2host.io
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

// v3.4.2 增加支持批量添加，及 options 参数
fetch('/webhook', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'taskadd',
    task: [         // 以数组的格式批量添加任务
      {
        name: '新的任务-exam',
        type: 'cron',
        job: {
          type: 'runjs',
          target: 'https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/webhook.js',
        },
        time: '10 8 8 * * *'
      },
      {
        name: 'apk安装命令',
        type: 'schedule',
        time: '0',
        running: false,
        job: {
          type: 'exec',
          target: 'apk add git'
        }
      }
    ],
    options: {              // v3.4.2 增加。可省略
      type: 'replace',      // 当任务列表中存在同名任务时的更新方式。replace: 替换原有任务，skip: 跳过添加新任务，addition: 新增任务
    }
  })
}).then(res=>res.text()).then(s=>console.log(s)).catch(e=>console.log(e))

// v3.4.2 同时添加 taskstart/taskstop 的批量处理
fetch('/webhook', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'taskstart',   // taskstart: 开始任务 taskstop: 停止任务
    tid: ['Wnj8rMaj', 'nPfq5Td3', 'cKUq3ViR'],     // 对应任务的 id
  })
}).then(res=>res.text()).then(res=>console.log(res)).catch(e=>console.log(e))

// # 增加/修改 store/cookie (v3.3.3)
fetch('/webhook', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
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
}).then(res=>res.text()).then(res=>console.log(res)).catch(e=>console.log(e))

// 在服务器中新增一个脚本文件(v3.4.0)
fetch('http://192.168.1.3/webhook', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'jsfile',
    op: 'put',
    fn: 'awbnew.js',      //脚本文件名
    rawcode: `//脚本文件内容
console.log('一个通过 webhook 新添加的文件')`
  })
}).then(res=>res.text()).then(res=>console.log(res)).catch(e=>console.log(e))

// 更改可访问后台管理页面的 IP(v3.4.0)
// enable, blacklist, whitelist 可只设置其他一项，其他项会自动保持原有参数
fetch('http://172.20.10.1/webhook', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'security',
    op: 'put',
    enable: false,
    blacklist: ['*'],
    whitelist: ['127.0.0.1', '172.20.10.1']
  })
}).then(res=>res.text()).then(res=>console.log(res)).catch(e=>console.log(e))

// 批量删除脚本(v3.4.2)
fetch('/webhook', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'deletejs',   // 同等于: deljs === jsdel === jsdelete
    // op: 'clear',     // 启用此项，表示删除默认脚本文件夹下的所有非脚本文件
    fn: ['test/starturl.js', 'test/restart.js', '0body.js', 'test.js']   // 使用数组表示多个要删除的脚本文件
  })
}).then(res=>res.text()).then(res=>console.log(res)).catch(e=>console.log(e))

// 打开代理端口（默认为 8001
fetch('/webhook', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a8c259b2-67fe-D-7bfdf1f55cb3',
    type: 'proxyport',
    op: 'open',     // 仅当该值为 open 时，表示打开。
  })
}).then(res=>res.text()).then(res=>console.log(res)).catch(e=>console.log(e))

// type 参数缺省，或对应参数不在列表中时，可使用脚本来处理 payload (v3.7.1)
fetch('/webhook?token=a8c259b2-67fe-D-7bfdf1f55cb3', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    // type: 'unknow', // type 缺省
    version: 14,       // payload(即 body 内容) 为其他未知值
    some: 'value',
  })
}).then(res=>res.text()).then(res=>console.log(res)).catch(e=>console.log(e))

// 在 webUI SETTING 设置好 WEBHOOK SCRIPT 相关内容后，可在对应脚本中使用 $env.payload 来获取任意网络请求的 payload
// 假如设置对应的脚本为 webhook.js ，webhook.js 的内容如下：
// console.log('获取到的 payload', $env.payload);$done($env.payload);
```

- 假如 elecV2P 可远程访问，可以使用使用其他任意程序发送网络请求进行调用
- webhook 可配合 **telegram bot** 或 **快捷指令** 等其他工具使用，方便快速调用 elecV2P 相关功能
- 通过 webhook 提供的 API，可以自行设计其他 UI 界面，实现与 elecV2P 交互
- v3.5.8 在脚本中增加函数 $webhook(type, options) ，详见 https://github.com/elecV2/elecV2P-dei/blob/master/docs/04-JS.md 相关说明