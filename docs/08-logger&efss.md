```
最近更新: 2021-12-04
适用版本: 3.5.4
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/08-logger&efss.md
```

## LOG 日志

物理存储位置：项目目录/logs。 ./logs
网络访问地址：webUI 端口/logs。 比如: http://127.0.0.1/logs

日志分类：
- 错误日志 errors.log
- shell 命令执行日志 funcExec.log
- 其他未处理类日志 elecV2Proc.log
- JAVASCRIPT 运行日志 xxx.js.log
- 定时任务 shell 指令日志 任务名.task.log
- 访问日志 access.log（v3.4.6 添加

支持多级目录。 比如在当前 logs 文件夹下有一个目录 backup, backup 下有一个日志文件 test.js.log，那么对应查看 url 为: http://127.0.0.1/logs/backup/test.js.log 。如果直接访问 http://127.0.0.1/logs/backup 将出列出该文件夹下的所有日志文件。

注意事项：
- 最多只显示 1000 个日志文件
- 未显示文件可以直接通过文件名访问。比如: http://127.0.0.1/logs/具体的日志名称.log
- 多级 JS 运行并不会生成多级日志。比如 test/123/45.js 脚本对应的日志名为 test-123-45.js.log

### errors.log

程序运行时所有的错误日志。如果程序意外崩溃/重启，可在此处查看错误原因。

### access.log

访问日志记录的是 websocket 的连接时间，可能并不是很准确，更详细的日志可在后台进行查看。

### funcExec.log

所有执行过的 Shell 指令及日志。

### 其他脚本日志

JS 脚本中 console 函数输出的内容。每个脚本单独一个文件，命名格式为: filename.js.log。
子目录中的 JS 日志文件名为，目录-文件名.js.log，比如: test-a.js.log

在 JSMANAGE 界面进行测试运行的脚本，日志命名格式为: filename-test.js.log。

*如果有太多日志文件，可直接手动删除，并不影响使用。默认 JS 文件中包含 deletelog.js，可设置一个定时任务进行自动清除。*

## 清空日志

手动删除：
cd logs
rm -f *  (该指令会删除当前目录下所有文件，请不在其他目录随意使用)

清除单个日志文件：
rm -f 日志文件名

或者在 JS 脚本中使用 **console.clear()** 函数，清空该脚本的所有日志。

自动删除：
使用自带的 deletelog.js 配合定时任务进行删除。
在 webUI -> TASK 界面添加一个定时任务，名称随意，时间自行选择，任务选择执行 JS，后面填写 deletelog.js。

例如，设置每天23点59分清除一下日志文件：

清空日志 | cron定时 | 59 23 * * * | 运行 JS | https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/deletelog.js

## EFSS - elecV2P file storage system

elecV2P 文件管理系统

目的：用于比较大的文件存储和读取，比如图片文件/视频文件。

功能：
- 共享主机任一文件夹内容，方便局域网内文件资料传输
- 通过 JS 下载网络文件至该目录
- 配合 $exec/手动安装 aria2, 实现下载磁力/种子文件等（测试中

### 访问路径 - /efss

例如：http://127.0.0.1/efss

*无论物理目录如何改变，网络访问地址不变*

### efss 目录设置

默认目录：当前工作路径/efss

可手动设置为其他任意目录

**./** - 相对目录。相对当前工作路径。 例如：./script/Shell, ./logs, ./script/JSFile, ./rootCA 等等

**/**  - 绝对目录。 例如： /etc, /usr/local/html, D:/Video 等等

**注意：**

* 如果目录中包含大量文件，例如直接设置为根目录 **/**，在引用时会使用大量资源（CPU/内存）去建立索引，请合理设置 efss 目录*
* 默认限制最大读取文件数为 600 （2021-02-20 更新添加）

## EFSS favend

EFSS favorite&backend，用于快速打开/查看某个目录的文件，以及将 JS 作为 backend 返回执行结果。

![favend](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/favend.png)

其中关键字表示 favend 访问路径，比如: **http://127.0.0.1/efss/test**, **http://127.0.0.1/efss/cloudbk**

**favend 的优先级高于 EFSS 目录中的文件**

比如: 假如 EFSS 默认目录中有一个文件 **mytest**, 同时存在某个 favend 的关键字也为 **mytest**，那么会返回 favend 中的对应结果。

### favend - favorite 收藏目录

返回某个文件夹下的所有文件列表。

默认最大返回文件数 **1000**，可在 url 中使用 max 参数来进行更改，比如: **http://127.0.0.1/efss/logs?max=8**
默认是否显示 dot(.) 开头文件共用 EFSS 中相关设置，也可以在 url 中使用参数 dotfiles 来设置，比如: **http://127.0.0.1/efss/logs?dotfiles=allow** (除 dotfiles=deny 外，其他任意值都表示 allow 允许)

### favend - backend 运行 JS

作为 backend 运行的 JS 默认 timeout 为 5000ms，也可以在 url 中使用参数 timeout 来修改，比如: **http://127.0.0.1/efss/body?timeout=20000**

该模式下的 JS 包含 **$request** 默认变量，且应该返回如下 object:

``` JS
console.log($request)   // 查看默认变量 $request 内容（该模式下的 console.log 内容前端不可见，只能在后台看到
// $request.method, $request.protocol, $request.url, $request.hostname, $request.path
// $request.headers<object>, $request.body<string>
// backend 特有属性 $env.key 表示访问该 backend 的关键字，$env.name 表示该 backend 名称
console.log(__version, 'cookieKEY:', $store.get('cookieKEY'))   // 其他默认变量/函数也可直接调用

// 最终网页返回结果
$done({
  statusCode: 200,    // 网页状态码，其他状态码也可以。比如: 404, 301, 502 等。可省略，默认为: 200
  headers: {          // 网页 response.headers 相关信息。可省略，默认为: {'Content-Type': 'text/html;charset=utf-8'}
    'Content-Type': 'application/json;charset=utf-8'
  },
  body: {             // 网页内容。这里面的内容会直接显示到网页中
    elecV2P: 'hello favend',
    cookieKEY: $store.get('cookieKEY'),
    request: $request,
  }
})

// === $done({ response: { statusCode, headers, body } })

// 当$done 是其他结果时，比如: $done('hello favend')
// elecV2P 会把最终结果当作 body 输出，其他项使用默认参数
```

favend 同时也接受 post/put 等网络请求，可在 body 中使用指定临时环境变量 env，比如:

``` JS
// 需提前在 EFSS 界面中设置好 favend 参数
// 然后使用浏览器的开发者工具发送如下请求（也可以在 webUI->JSMANAGE 中模拟网络请求
fetch('http://127.0.0.1/efss/envtest', {
  method: 'put',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "timeout": 2000,
    "env": {
      "param": "传递一个变量"
    }
  })
}).then(res=>res.text()).then(s=>console.log(s)).catch(e=>console.error(e))

// envtest 对应运行的 JS 如下:
console.log('临时环境变量', $env.param, 'favend key', $env.key, 'favend name', $env.name)

// 注意: $request.body 为字符串类型，$env 为 object 类型
console.log('request body type:', typeof $request.body, '$env type', typeof $env)

$done({
  body: {
    'param': `通过 ${ $request.method } 获取到的 param: ${ $env.param }`,
    'request': $request
  }
})
```

### elecV2P favend html(.efh)  (v3.5.4 新增文件格式)

一个同时包含前后端运行代码的 html 扩展格式，也可以说是一个文件协议或标准。基础结构如下：

``` xml
<div>原来的 html 格式/标签/内容</div>
<script type="text/javascript">
  console.log('原 html 页面中的 script 标签')
</script>
<!-- 上面为原 html 页面，下面为扩展部分 -->
<script type="text/javascript" runon="elecV2P">
  console.log('efh 文件的扩展部分')
</script>
```

执行过程/基本原理:
- 首次执行 .efh 文件时，先使用 cheerio 模块将 efh 文件分离为**前端和后端**，并进行缓存
- 然后当使用 get 请求主页时，直接返回**前端**代码
- 当收到其他请求时，执行**后端**代码并返回执行结果

优点:
- 前后端代码同一页面，方便开发者统一管理
- 结构更清晰，标签高亮（最初要解决的问题
- 沿用 html 语法，没有额外的学习成本

缺点:
- 前后端数据传输不够简洁

#### efh 实战测试

一个简单的测试文件: https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/elecV2P.efh

favend 当前只支持运行本地 efh 文件，在 favend 中**类型**选择 **运行 JS**, 目标填写 **elecV2P.efh**（*efh 文件可在 JSMANAGE 界面推送/上传/编辑*）

``` XML
<h3>一个简单的 efh 格式示例文件</h3>
<div><label>请求后台数据测试</label><button onclick="dataFetch()">获取</button></div>

<script type="text/javascript">
  console.log('前端 JS')
  // 前端部分可使用多个 script 标签引入远程 axios/vue/react 等文件
  async function dataFetch() {
    let data = await fetch('?data=json').then(res=>res.text()).catch(e=>console.error(e))
    console.log(data)
    alert(data)
  }
</script>

<script type="text/javascript" runon="elecV2P" src="favend.js">
  // 使用 runon="elecV2P" 属性来表示此部分是运行在后台的代码
  // 使用 src 属性表示使用服务器上的 JS 作为后台代码
  // 当有 src 属性时下面的代码无效（建议测试时去掉
  console.log('后台 JS')

  $done({
    body: {
      hello: 'elecV2P favend',
      data: $store.get('cookieKEY'),
      reqbody: $request.body
    }
  })
</script>
```

待优化：
- 远程 efh 文件下载运行
- 前后台更好/优雅的传输数据($fend
- 前后台数据的持续交互
- 缓存清理