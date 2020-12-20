```
最近更新： 2020-12-02
适用版本： 2.8.1
```

## LOG 日志

存储位置：项目目录/logs。 ./logs
访问地址： http://127.0.0.1/logs

日志分类：
- errors.log
- funcExec.log
- 其他脚本日志

### errors.log

程序运行时所有的错误日志。如果程序意外崩溃，重启，可在此处查看错误原因。

### funcExec.log

所有执行过的 Shell 指令及日志。

*shell 指令功能比较强大，可以对系统造成不可挽回的破坏，请谨慎使用。*

### 其他脚本日志

JS 脚本中 console 函数输出的内容。每个脚本单独一个文件，命名格式为：filename.js.log。
子目录中的 JS 日志文件名为，目录-文件名.js.log，比如：test-a.js.log

在 JSMANAGE 界面进行测试运行的脚本，日志命名格式为：filename-test.js.log。

## efss - elecV2P file storage system

elecV2P 文件管理系统

目的：用于比较大的文件存储和读取，比如图片文件/视频文件。

功能：
- 共享主机任一文件夹内容，方便局域网内文件资料传输。
- 通过 JS 下载网络文件至该目录
- 配合 $exec / 手动安装 aria2, 实现下载磁力/种子（测试中

### 访问路径 - /efss

例如：http://127.0.0.1/efss

*无论物理目录如何改变，网络访问地址不变*

### efss 目录

默认目录：当前工作路径/efss

如需修改为其他目录，前往 webUI->SETTING->EFSS 目录 进行设置。

**./** - 相对目录。相对当前工作目录
例如：./script/Shell, ./logs

**/**  - 绝对目录。
例如： /etc, /usr/local/html

*如果目录中包含大量静态文件，例如直接设置为根目录 **/**，可能引用比较耗时，请合理设置 efss 目录*
*默认最大读取文件数为 200*