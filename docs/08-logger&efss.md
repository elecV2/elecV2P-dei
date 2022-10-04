```
最近更新: 2022-10-03
适用版本: 3.7.2
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

或者在脚本中使用 **console.clear()** 函数，清空该脚本的相关日志。

自动删除：
使用自带的 deletelog.js 配合定时任务进行删除。
在 webUI -> TASK 界面添加一个定时任务，名称随意，时间自行选择，任务选择执行 JS，后面填写 deletelog.js。

例如，设置每天23点59分清除一下日志文件：

清空日志 | cron定时 | 59 23 * * * | 运行 JS | https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/deletelog.js

## EFSS - elecV2P file storage system

elecV2P 文件管理系统

目的：用于比较大的文件存储和读取，比如图片文件/视频文件。

功能：
- 共享任一文件夹，方便局域网内文件传输
- 下载远程网络文件至任意目录
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

- 如果目录中包含大量文件，例如直接设置为根目录 **/**，在引用时会使用大量资源（CPU/内存）去建立索引，请合理设置 efss 目录*
- 默认最大显示文件数为 600（可更改
- 没有显示的文件可以直接通过文件名访问
- 下载远程文件时，可使用 -rename 重命名文件。比如: https://x.com/l.json -rename=h.json

## EFSS favend

EFSS favorite&backend，用于快速打开/查看某个目录的文件(favorite)，以及将脚本作为 backend 返回执行结果。

可以简单理解为 favorite 返回系统静态文件，backend 返回脚本动态生成的“文件”。

![favend](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/favend.png)

其中关键字表示 favend 访问路径，比如: **http://127.0.0.1/efss/test**, **http://127.0.0.1/efss/cloudbk**

**favend 的优先级高于 EFSS 目录中的文件**

比如: 假如 EFSS 默认目录中有一个文件 **mytest**, 同时存在某个 favend 的关键字也为 **mytest**，那么会返回 favend 中的对应结果。(**请尽可能的避免此种情况**)

### favend - favorite 收藏目录

列出某个文件夹下的所有文件。

默认最大返回文件数 **1000**，可在 url 中使用 max 参数来进行更改，比如: **http://127.0.0.1/efss/logs?max=8**

默认是否显示 dot(.) 开头文件共用 EFSS 中相关设置，也可以在 url 中使用参数 dotfiles 来设置，比如: **http://127.0.0.1/efss/logs?dotfiles=allow** (除 dotfiles=deny 外，其他任意值都表示 allow 允许)

v3.7.1 后将在收藏目录下自动寻找 "index" 文件，默认为 **index.html**（不包含子目录）。比如收藏目录 x/blog 下存在文件 index.html，将直接显示 index.html 页面。可在 url 中使用 index 参数修改待查找的 index 文件，比如 **http://127.0.0.1/efss/blog/?index=main.html** (blog 后面须有斜杠/)，将会显示 main.html 页面（如果存在的话）。如果 index 文件不存在，将像之前一样返回所有文件列表。

作用：

- 给 task/rewrite 设置专门的订阅目录
- 搭建临时静态网站
- 小型网盘资源分享
- 记录收藏常用目录

### favend - backend 运行脚本

作为 backend 运行的脚本默认 timeout 为 5000ms，也可以在 url 中使用参数 timeout 来修改，比如: **http://127.0.0.1/efss/body?timeout=20000**

该模式下的 JS 包含 **$request** 默认变量，且应该返回如下 object:

``` JS
console.log($request)   // 查看默认变量 $request 内容（该模式下的 console.log 内容前端不可见，只能在后台看到
// $request.method, $request.protocol, $request.url, $request.hostname, $request.path
// $request.headers<object>, $request.body<string>

// backend 特有属性 $env.key 表示访问该 backend 的关键字，$env.name 表示该 backend 名称
console.log($env.key, $env.name, __version, 'cookieKEY:', $store.get('cookieKEY'))   // 其他默认变量/函数也可直接调用

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

favend 也接受 post/put 等请求。支持在 body 中添加临时环境变量(env)参数，比如:

``` JS
// 需提前在 EFSS 界面中设置好 favend 参数 envtest
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

``` HTML
<div>原来的 html 格式/标签/内容</div>
<script type="text/javascript">
  console.log('原 html 页面中的 script 标签')
</script>
<!-- 上面为原 html 页面，下面为扩展部分 -->
<!-- <script type="text/javascript" runon="elecV2P"> v3.6.7 版本之前的写法 -->
<script favend>
  console.log('efh 文件的扩展部分')
</script>
```

执行过程/基本原理:
- 首次执行 efh 文件时，将文件分离为**前端和后台**部分，并进行缓存
- 然后当收到 POST 请求时，执行**后台部分**代码，返回执行结果
- 当收到其他请求时，直接返回**前端 HTML** 页面

优点:
- 前后端代码同一页面，方便开发者统一管理
- 标签内代码高亮（最初要解决的问题
- 沿用 html 语法，没有额外的学习成本

#### efh 实战测试

测试文件: https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/elecV2P.efh
适用版本: v3.5.5

在 EFSS 页面 favend 相关设置中添加新的规则，设置好名称和关键字，**类型** 选择 **运行脚本**, 目标填写 efh 文件远程或本地地址（*本地文件可在 webUI->JSMANAGE 脚本管理界面推送/上传/编辑*），然后点击保存(ctrl+s)，最后在操作栏中点击运行。

#### efh 格式文件说明

``` HTML
<h3>一个简单的 efh 格式示例文件</h3>
<div><label>请求后台数据测试</label><button onclick="dataFetch()">获取</button></div>
<input type="text" name="data" class="data" placeholder="data">

<script type="text/javascript">
  // v3.7.2 增加 $ 简易选择器函数，示例：
  // let data = $('.data').value;   // 等价于 document.querySelector('.data').value
  // let div  = $('div', 'all');    // 等价于 document.querySelectorAll('div')

  // $fend 默认函数用于前后端数据交互（本质为一个 fetch 的 post 请求
  function dataFetch() {
    $fend('data').then(res=>res.text())
    .then(res=>{
      console.log(res)
      alert(res)
    })
    .catch(e=>{
      console.error(e)
      alert('error: ' + e.message)
    })
  }
</script>
<!-- 前端部分可以使用多个 script 标签
使用 src 引入任意远程文件，比如：
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

(v3.7.1) 如需引入 elecV2P 服务器上的本地脚本，加上 /script 前缀，比如：
<script src="/script/webhook.js"></script>
支持多级目录，比如：
<script src="/script/test/webhook.js"></script>
前端 src 暂不支持使用相对目录，比如 src='./webhook.js' ，会提示脚本不存在
-->

<!-- 后台代码仅能使用一个 script 标签，如有其他多的标签将被当作前端代码处理
使用 runon="elecV2P" 属性来表示此部分脚本是运行在后台的代码
v3.6.7 之后可简写为 <script favend>  -->
<script type="text/javascript" runon="elecV2P">
  // 后台 $fend 第一参数需与前端对应，第二参数为返回给前端的数据
  $fend('data', {
    hello: 'elecV2P favend',
    data: $store.get('cookieKEY'),
    reqbody: $request.body
  })
  $done('no $fend match');
</script>
<!-- 后台 script 标签同样支持 src 属性，比如：
<script favend src="https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/favend.js"></script>

后台 src 在引入 elecV2P 服务器上的本地脚本时，无需添加 /script 前缀，支持相对、绝对目录，比如：
<script favend src="favend.js"></script>
<script favend src="./0body.js"></script>
// 相对目录，表示的是相对于当前 efh 文件
<script favend src="/webhook.js"></script>
// 绝对目录，表示的是服务器上的脚本根目录
```

其他说明：
- 无后台代码时直接返回前端 html 内容
- 直接运行 efh 脚本时，返回前端 html 内容
- 远程 efh 更新间隔和远程 JS 更新间隔同步
- v3.5.5 增加默认 $fend 函数用于前后端数据交互（具体参考 [04-JS.md](https://github.com/elecV2/elecV2P-dei/blob/master/docs/04-JS.md) $fend 相关部分
- 其他 efh 示例脚本：https://github.com/elecV2/elecV2P-dei/tree/master/examples/JSTEST/efh
- 另一篇相关说明文章：https://elecv2.github.io/#efh：一种简单的%20html%20语法扩展结构

待优化项：
- 其他类型数据 arrayBuffer/stream 等
- $fend 后台无匹配时返回结果
- 默认前端内置脚本可选择是否使用远程链接

优化完成：
- 前后台数据的持续交互($ws.sse
- efh 前端调用本地 JS/CSS/图片 等（part done
- $fend key/路由 配对优化
- runJS 直接运行 efh 文件
- 前后台更好/优雅的传输数据($fend（done
- 缓存清理(done) $fend.clear();