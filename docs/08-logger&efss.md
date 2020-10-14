```
最近更新： 2020-10-14
适用版本： 2.5.9
```

# logger - class

``` JS nodejs
const { logger } = require('./utils')
const clog = new logger({ head: 'example', level: 'debug', file: 'test' })
clog.info('hello elecV2P!')

// 结果 [example     info][2020-6-20 8:48:56]: hello elecV2P!
```

## log 级别 - level

- error
- notify
- info
- debug

默认 'info', 即除 debug 信息外，其他信息全部显示

## new logger({}) 接收参数

- head:          日志头部标识。省略为 *elecV2P*
- level:         日志纪录级别。省略为 *info*
- isalignHead:   是否对齐日志开头部分。 省略为对齐，*false* 取消对齐
- cb:            接收一个回调函数进一步处理输出的日志信息
- file:          日志保存文件。 省略不保存，设置任一值，日志文件将保存到 **logs** 文件夹

## 全局日志级别

``` JS nodejs
const { setGlog } = require('./utils')
setGlog('debug')

// 只有当 new logger({}) 中的参数 level 和 全局日志 level 同时为 debug，才会输出 debug 信息
```

# efss - elecV2P file storage system

目的：用于比较大的文件存储和读取，比如图片文件/视频文件。

已实现功能：共享主机任一文件夹内容，方便局域网内文件资料传输。

计划：
- 未来可配合定时任务/脚本使用，下载保存磁力/种子文件。
- 也可作为一个简易的网盘使用。

## 访问路径 - /efss

例如：http://127.0.0.1/efss

## efss 目录

默认目录：当前工作路径/efss

如需修改为其他目录，前往 webUI->setting->EFSS 目录 进行设置。

**./** - 相对目录。相对当前工作目录
例如：./script/Shell, ./logs

**/**  - 绝对目录。
例如： /etc, /usr/local/html

*如果目录中包含大量静态文件，例如直接设置为根目录 **/**，可能引用比较耗时，请合理设置 efss 目录*

*默认最大读取文件数为 200*