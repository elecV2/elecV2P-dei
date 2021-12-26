### runJSFile 函数逻辑

执行的脚本类型

- 本地文件
- 远程文件
- rawcode

命名

runJSFile(filename, addContext={})

```
type       filename                        rawjs
- rawjs    rename filename rawcode.js      rawjs
- local    rename filename                 Jsfile.get
- remote   rename surlName                 Jsfile.get
```

addContext.filename vs addContext.rename
renmae 会重新写入文件

addContext.timeout: 只提前返回，不限制运行时间（已修改为限制运行时间，同步模式下