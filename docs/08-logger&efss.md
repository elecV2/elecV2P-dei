```
最近更新： 2021-04-03
适用版本： 3.2.9
```

## LOG 日志

物理存储位置：项目目录/logs。 ./logs
网络访问地址：webUI端口/logs。 比如: http://127.0.0.1/logs

日志分类：
- 错误日志 errors.log
- shell 命令执行日志 funcExec.log
- 其他未处理类日志 elecV2Proc.log
- JAVASCRIPT 运行日志 xxx.js.log
- 定时任务 shell 指令日志 任务名.log

v3.2.9 增加支持二级目录，二级目录访问时在 url 中目录以两个下线(\_\_) 开始和结束。 比如在当前 logs 文件夹下有一个二级目录 backup, backup 文件夹中有一个日志文件 test.js.log，那么要在浏览器中查看该文件时 url 应该为: http://127.0.0.1/logs/__backup__test.js.log （实际访问时不用手动输入，从首页开始直接点就可以了）。
另外这里会导致的一个问题就是：如果原 JS 文件名是以两个下划线开始，且后面还有两个下划线，在读取该 JS 的运行日志时会出错，所以尽量不要用这种方式命名 JS 文件。如果必须要这样命名，或者想查看更多级的目录日志，可以在 EFSS 页面设置目录为 ./logs

### errors.log

程序运行时所有的错误日志。如果程序意外崩溃，重启，可在此处查看错误原因。

### funcExec.log

所有执行过的 Shell 指令及日志。

*shell 指令功能比较强大，可以对系统造成不可挽回的破坏，请谨慎使用。*

### 其他脚本日志

JS 脚本中 console 函数输出的内容。每个脚本单独一个文件，命名格式为：filename.js.log。
子目录中的 JS 日志文件名为，目录-文件名.js.log，比如：test-a.js.log

在 JSMANAGE 界面进行测试运行的脚本，日志命名格式为：filename-test.js.log。

*如果有太多日志文件，可直接手动删除，并不影响使用。默认有一个 deletelog.js 文件，可设置一个定时任务进行自动清除。*

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