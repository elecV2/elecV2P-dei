```
最近更新： 2020-7-8
适用版本： 2.0.5
```

# logger - class

``` JS
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

``` JS
const { setGlog } = require('./utils')
setGlog('debug')

// 只有当 new logger({}) 中的参数 level 和 全局日志 level 同时为 debug，才会输出 debug 信息
```