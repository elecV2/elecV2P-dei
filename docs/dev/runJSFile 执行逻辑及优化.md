### runJSFile 函数逻辑

runJSFile(filename, addContext={})

```
type       filename                        rawjs
- rawjs    rename filename rawcode.js      rawjs
- local    rename filename                 Jsfile.get
- remote   rename surlName                 Jsfile.get
```

addContext.filename vs addContext.rename
renmae 会重新写入文件

addContext.timeout: 只提前返回，不限制运行时间