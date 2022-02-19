## 目的

用一个 .json 文件作为启动的快捷方式，方便将多个动作进行组合，及一键运行。

## 运行

应该包含的动作，或者说功能：

- 关键字: 对应功能

具体任务类
- script: 运行脚本
- shell: 执行 shell 指令
- task:  开始/暂停任务
- download:  下载文件（可能增加可选择下载方式 type git/wget/aria2c 等
- notify: 发送通知
- open:  直接打开一个 url 或 文件
- efh: 打开 efh 文件

执行逻辑类
- if:    如果逻辑 （每个任务执行后判断？
- next:  下一个任务（配合 if 使用
- done:  结束语句
- for:   for 循环逻辑
- while: while 循环逻辑

## 格式 2021-12-16 18:06

（研究中，非最终版本

``` JSON
{
  "log": "path/to/my.log",                  // 启动后日志保存路径。可省略
  "name": "一个启动文件",
  "note": "关于该启动器的一些说明",
  "logo": "https://xxx.com/xxx.png",        // 对应图标
  "author": "作者 elecV2",
  "resouce": "https://xxxxxx/xxxx.json",    // 远程更新地址
  "actions": [     // 待执行的系列动作
    {
      "name": "任务一",
      "id": "taskone",           // 使用 id 方便跳转
      "type": "script",          // 可以使用远程脚本
      "args": ["test.js", {"grant": "nodejs"}],
    }, {
      "name": "任务二",
      "type": "shell",
      "args": ["node", "-v"]
    }, {
      "name": "停止任务",
      "type": "task",
      "next": "anot",          // 使用 next + id 进行跳转
      "args": ["stop", "taskid"]
    }, {
      "name": "下载文件一",
      "type": "download",
      "args": ["https://resouce.url", "path/to/save", "type|wget|..."]
    }, {
      "name": "efh 测试",
      "type": "efh",
      "args": ["path/to/router", "type|wget|..."]
    }, {
      "id": "anot",
      "name": "发送通知",
      "type": "notify",
      "args": ["title", "body", "url", "bark|ifttt|cust|或省略"]
    }
  ],
  "mixif": "amixif.js",        // 每次任务完成后的判断脚本。可省略
}
```

说明:

mixif: 
使用某个脚本对每次执行的任务结果进行判断。传入如下几个参数:
- 任务结果  $env.acres
- 任务 id/或顺序  $env.acid
- 任务名称  $env.acname

返回执行结果
- 不作任何处理
- 跳转到一下任务 next
- 结束运行 done

### 待解决的问题

- 获取上一个任务的执行结果
- 加入 IF/WHILE/FOR 等逻辑
- .JSON 文件的可视化编辑

#### 非问题的问题

其实这些都可以在一个 JS 里面完成，所以有必要吗？

有。可以组合不同的脚本使用，方便进行整合。最主要是可以为以后的拖动/可视化编辑打好基础。

没有。纯属闲得蛋疼，会有人用这个吗？闲着没事做吗？纯属浪费时间。会获得什么吗？值得吗？