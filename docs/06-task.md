```
最近更新： 2021-03-17
适用版本： 3.2.6
```

![task](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/taskall.png)

### 时间格式

- 倒计时 30 999 3 2  (以空格分开的四个数字，后三项可省略)

|     30(秒)      |     999（次）    |      3（秒）         |       2（次）       
: --------------: | :--------------: | :------------------: | :------------------:
| 基础倒计时时间  |  重复次数（可选）| 增加随机时间（可选） | 增加随机重复次数（可选）  

*当重复次数大于等于 **999** 时，无限循环。*

示例： 400 8 10 3 ，表示倒计时40秒，随机10秒，所以具体倒计时时间位于 40-50 秒之间，重复运行 8-11 次

- cron 定时 

时间格式：* * * * * * （五/六位 cron 时间格式）

| * (0-59)   |  * (0-59)  |  * (0-23)  |  * (1-31)  |  * (1-12)  |  * (0-7)      
:----------: | :--------: | :--------: | :--------: | :--------: | :---------:
| 秒（可选） |    分      |    小时    |     日     |     月     |    星期


## 可执行任务类型

- 运行 JS  : runjs
- 开始任务 : taskstart
- 停止任务 : taskstop
- Shell 指令: exec

### 运行 JS

支持本地 JS, 及远程 JS。 
本地 JS 文件位于 script/JSFile 目录，可在 webUI 管理界面的 JSMANAGE 中查看当前可用 JS。 如需使用定时运行，直接复制文件名到 TASK 任务列表的任务栏对应框即可。

如使用远程 JS，则直接在任务栏对应框内输入以 **https?** 开头的网络地址。远程 JS 默认更新时间为 86400 秒（一天），可在 webUI->SETTING 界面修改。超过此时间，则会先下载最新的 JS 文件，然后再执行。如果下载失败，会继续尝试执行本地文件。
所以在执行需要特别准时的任务时，不建议使用远程 JS。或者提前手动更新一下，避免执行任务时先下载文件带来的延迟。

定时任务运行 JS 还支持附带 env 变量, 使用 **-e** 关键字进行声明，然后在 JS 文件中使用 **$变量名** 的方式进行读取。例如： **exam-js-env.js -e name=一个名字 cookie=acookiestring**

``` JS exam-js-env.js
let name = 'elecV2P'
if (typeof($name) != "undefined") {
  name = $name
}
console.log('hello', name)

if (typeof($cookie) != "undefined") {
  console.log('a cookie from task env', $cookie)
}
```

### Shell 指令

Shell 指令的运行使用了 nodejs 的 [child_process_exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) 模块

timeout 默认为 60000ms（60秒）
cwd 默认目录为 script/Shell

``` sh 示例命令
# 单条命令
ls
node -v
start https://github.com/elecV2/elecV2P
reboot

# 文件执行(先将相关文件放置到 script/Shell 目录下)
hello.sh
test.py
binaryfile
# 以上文件会通过系统默认程序打开，请先安装好对应执行环境，以及注意文件的执行权限
```

**v3.2.6 更新增加 -env/-cwd 变量** (*v2.3.4 版本到 v3.2.5版本，使用关键字是 -e/-c，为避免和其他命令冲突，v3.2.6 修改为 **-env/-cwd***)
可通过 **-cwd/-env** 关键字更改工作目录和环境变量，比如:

``` sh
sh hello.sh -env name=Polo
ls -cwd script/JSFile
```

## 保存任务列表

当点击**保存当前任务列表**后，当前任务列表，包含运行状态，以及订阅信息列表，会保存到 script/Lists/task.list 文件中，在重启 elecV2P 后，任务列表会自动从 task.list 中恢复。保存的任务基本格式为：

``` JSON task.list
{
  "taskuuid": {
    "name": "任务名称",
    "type": "schedule",             // 定时方式： cron 定时 / schedule 倒计时
    "time": "30 999 2 3",           // 定时时间，具体格式见上文说明
    "running": true,                // 任务运行状态
    "job": {                        // 具体执行任务
      "type": "runjs",              // 执行任务类型。 具体见上文 **可执行任务类型**
      "target": "test.js",          // 执行任务目标/指令
    }
  },
  "J8R0fbBN": {
    "name": "查看当前目录文件",
    "type": "cron",
    "time": "2 3 4 * * *",
    "running": false,
    "job": {
      "type": "exec",
      "target": "ls"
    }
  },
  "V2vw4B5D": {
    "name": "定时任务订阅",
    "type": "sub",                  // v3.2.1 增加定时任务订阅功能。以 type = sub 表示
    "job": {
      "type": "skip",               // 当订阅中存在同名任务时，选择合并方式： skip 跳过，replace: 替换, addition: 新增
      "target": "https://raw.githubusercontent.com/elecV2/elecV2P/master/efss/tasksub.json",   // 远程订阅链接
    }
  }
}
```

**实际 list 文件为严格的 JSON 格式，不能包含任何注释**

## 远程订阅（请勿添加不信任的订阅链接）

*v3.2.1 添加功能，更新后前往 webUI->TASK 界面查看。（不兼容其他软件的订阅格式）*

![tasksub](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/tasksub.png)

订阅内容格式为 JSON, 相关参数如下：
``` JSON
{
  "name": "elecV2P 定时任务订阅",     // 订阅名称
  "author": "https://t.me/elecV2",    // 订阅制作者，可省略
  "date": "2021-02-26 23:32:04",      // 订阅生成时间，可省略
  "surl": "https://raw.githubusercontent.com/elecV2/elecV2P/master/efss/tasksub.json",  // 原始订阅链接，可省略
  "desc": "订阅描述，可省略。该订阅仅可用于 elecV2P, 与其他软件并不兼容。",
  "list": [                           // 任务列表。任务格式参考上面的 task.list 部分
    {
      "name": "软更新",
      "type": "cron",
      "time": "30 18 23 * * *",
      "running": true,                // running 状态可省略。仅当 running 值为 false 时，表示只添加该任务而不运行
      "job": {
        "type": "runjs",              // 远程订阅的任务类型只支持 runjs(运行 JS) 和 exec(执行 Shell 指令)
        "target": "https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/softupdate.js"
      }
    },
    {
      "name": "清空日志",            // 当 running 值省略时，添加任务也会自动执行
      "type": "cron",
      "time": "30 58 23 * * *",
      "job": {
        "type": "runjs",
        "target": "https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/deletelog.js"
      }
    },
    {
      "name": "Python 安装(Docker下)",
      "type": "schedule",
      "time": "0",
      "running": false,               // 当 running 值为 false 时，任务只添加不运行
      "job": {
        "type": "runjs",
        "target": "https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/python-install.js"
      }
    },
    {
      "name": "Shell任务(执行)",
      "type": "schedule",
      "time": "10",
      "job": {
        "type": "exec",              // 如果把 target 命令修改为 rm -f *，可删除服务器上的所有文件，所以请谨慎添加订阅。
        "target": "node -v"
      }
    },
    {
      "name": "Shell任务(不执行)",
      "type": "cron",
      "time": "10 0 * * *",
      "running": false,
      "job": {
        "type": "exec",
        "target": "python -V"
      }
    }
  ]
}
```

- 本地订阅文件导入

在 http://127.0.0.1/efss 界面上传订阅文件，然后添加一个本地订阅，例如：http://127.0.0.1/efss/tasksub文件名.json
或者远程 https://xxx/efss/tasksub.json

*如果在确认网络通畅的情况下（订阅链接可以直接通过浏览器访问），但在获取订阅内容时出现了 Network Error 的错误提醒，可能是浏览器 CORS 导致的问题，尝试直接下载文件上传到 efss 目录，然后本地订阅*

- 其他订阅格式转换

参考脚本 https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/exam-tasksub.js

**当订阅任务中包含类似 rm -f * 的 Shell 指令时，可能会删除服务器上的所有文件，所以请勿必清楚具体订阅任务后再进行添加，不要添加不信任来源的订阅**