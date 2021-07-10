```
最近更新: 2021-07-08
适用版本: 3.4.2
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/08-logger&efss.md
```

## LOG 日志

物理存储位置：项目目录/logs。 ./logs
网络访问地址：webUI端口/logs。 比如: http://127.0.0.1/logs

日志分类：
- 错误日志 errors.log
- shell 命令执行日志 funcExec.log
- 其他未处理类日志 elecV2Proc.log
- JAVASCRIPT 运行日志 xxx.js.log
- 定时任务 shell 指令日志 任务名.task.log

v3.4.2 增加支持多级目录。 比如在当前 logs 文件夹下有一个目录 backup, backup 下有一个日志文件 test.js.log，那么对应查看 url 为: http://127.0.0.1/logs/backup/test.js.log。 如果直接访问 http://127.0.0.1/logs/backup，将出列出该文件夹下的所有日志文件。
注意事项：
- 最多只显示 1000 个日志文件
- 未显示文件可以直接通过文件名访问。比如: http://127.0.0.1/logs/具体的日志名称.log
- 多级 JS 运行并不会生成多级日志。比如 test/123/45.js 脚本对应的日志名为 test-123-45.js.log (\_\_name.replace(/\/|\\\\/g, '-'))

### errors.log

程序运行时所有的错误日志。如果程序意外崩溃，重启，可在此处查看错误原因。

### funcExec.log

所有执行过的 Shell 指令及日志。

*shell 指令功能比较强大，请谨慎使用。*

### 其他脚本日志

JS 脚本中 console 函数输出的内容。每个脚本单独一个文件，命名格式为: filename.js.log。
子目录中的 JS 日志文件名为，目录-文件名.js.log，比如: test-a.js.log

在 JSMANAGE 界面进行测试运行的脚本，日志命名格式为: filename-test.js.log。

*如果有太多日志文件，可直接手动删除，并不影响使用。默认 JS 文件中包含 deletelog.js，可设置一个定时任务进行自动清除。*

### 清空日志

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

## efss - elecV2P file storage system

elecV2P 文件管理系统

目的：用于比较大的文件存储和读取，比如图片文件/视频文件。

功能：
- 共享主机任一文件夹内容，方便局域网内文件资料传输。
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

## EFSS favend (v3.4.2 添加)

EFSS favorite&backend，用于快速打开/查看某个目录的文件，以及将 JS 作为 backend 返回执行结果。

![favend](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/favend.png)

其中关键字表示 favedn 访问路径，比如: **http://127.0.0.1/efss/test**, **http://127.0.0.1/efss/cloudbk**

**favend 的优先级高于 EFSS 目录中的文件**

比如: 假如 EFSS 默认目录中有一个文件 **mytest**, 如果没有设置 favend，当访问 /efss/mytest 的时候，直接返回 mytest 文件内容。但如果存在某个 favend 的关键字同样为 **mytest**，那么会返回 favend 中的对应结果。

### favend - favorite 收藏目录

返回某个文件夹下的所有文件列表。

默认最大返回文件数 **1000**，可在 url 中使用 max 参数来进行更改，比如: **http://127.0.0.1/efss/logs?max=8**
默认是否显示 dot(.) 开头文件共用 EFSS 中相关设置，也可以在 url 中使用参数 dotfiles 来设置，比如: **http://127.0.0.1/efss/logs?dotfiles=allow** (除 dotfiles=deny 外，其他任意值都表示 allow 允许)

### favend - backend 运行 JS

作为 backend 运行的 JS 默认 timeout 为 5000ms，也可以在 url 中使用参数 timeout 来修改，比如: **http://127.0.0.1/efss/body?timeout=20000**

该模式下的 JS 包含 **$request** 默认变量，且应该返回如下 object:

``` JS
console.log($request)   // 查看默认变量 $request 内容。（该模式下的 console.log 内容前端不可见，只能在后台看到
// $request.method, $request.protocol, $request.url, $request.hostname, $request.path, $request.headers, $request.body
// bakend 特有属性 $request.key 表示访问该 backend 的关键字
console.log(__version, 'cookieKEY:', $store.get('cookieKEY'))   // 其他默认变量/函数也可直接调用

// 最终网页返回结果
$done({
  statusCode: 200,    // 网页状态码，其他状态码也可以。比如: 404, 301, 502 等。可省略，默认为: 200
  headers: {          // 网页 response.headers 相关信息。可省略，默认为: {'Content-Type': 'text/html;charset=utf-8'}
    'Content-Type': 'application/json;charset=utf-8'
  },
  body: {             // 网页内容
    elecV2P: 'hello favend',
    request: $request,   // 这里面的内容会直接显示到网页中
  }
})

// === $done({ response: { statusCode, headers, body } })
```

当返回结果不是以上 $done 中的格式时，将会把最终结果作为 body 输出，其他项使用默认参数。