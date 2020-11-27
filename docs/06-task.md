```
最近更新： 2020-11-27
适用版本： 2.7.8
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

|   * (0-59)   |  * (0-59)  |  * (0-23)  |  * (1-12)  |  * (1-31)  |  * (0-7)      
:------------: | :--------: | :--------: | :--------: | :--------: | :---------:
|  秒（可选）  |    分      |    小时    |      月    |     日     |    星期


## 可执行任务类型

- 运行 JS  : runjs
- 开始任务 : taskstart
- 停止任务 : taskstop
- Shell 指令: exec

### 运行 JS

支持本地 JS, 及远程 JS。 
本地 JS 文件位于 script/JSFile 目录，可在 webUI 管理界面的 JSMANAGE 中查看当前可用 JS。 如需使用定时运行，直接复制文件名到 TASK 任务列表的任务栏对应框即可。

如使用远程 JS，则直接在任务栏对应框内输入以 **https?** 开头的网络地址。远程 JS 默认更新时间为 86400 秒（一天），超过此时间，则会先自动下载最新的 JS 文件，然后再执行。
所以在执行需要特别准时的任务时，不建议使用远程 JS。或者提前手动更新一下，避免执行任务时先下载文件带来的延迟。当然也可以在管理界面的 SETTING 设置项中随时修改更新时间间隔。

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

timeout 默认为 5000ms（5秒）
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

**2.3.4 更新 -e/-c**
可通过 **-c/-e** 关键字更改工作目录和环境变量。

``` sh 示例命令
hello.sh -e name=Polo
ls -c script/JSFile
```

## 保存任务列表

当点击**保存当前任务列表**后，当前任务列表，包含运行状态，会保存到 script/Lists/task.list 文件中，在重启服务后，任务列表会自动从 task.list 文件中恢复。保存的任务基本格式为：

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
    "name": "任意的任务名称",
    "type": "cron",
    "time": "2 3 4 * * *",
    "runjs": false,
    "job": {
      "type": "exec",
      "target": "ls"
    }
  }
}
```

*实际 list 文件为严格 JSON 格式，不能包含任何注释*