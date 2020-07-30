## elecV2P 高级篇

*新手慎用*

# minishell

小型 shell 网页客户端，可执行一些简单的 shell 命令。比如：**ls**、 **rm -rf \***、 **reboot** 等

## 开启方式

在 script/list/config.json 添加

``` json
{
  // ... 其他保持不变
  "minishell": true
}
```

然后重启服务，再打开 webUI， 在 setting 的右上角有一个蓝黑的小圈，点击即可打开 **minishell** 界面。

**minishell** 的通信基于 websocket，确保执行任何命令前 websocket 是成功连接。

## 基础使用

minishell 基于 nodejs 的 child_process exec。另外做了一些修改。

比如，跨平台的命令转换。在 windows 平台输入 **reboot** 命令，会自动转化为 **restart-computer**，相当于统一了 linux 和 windows 的 shell 命令。

更多跨平台统一命令持续添加中。

*如果在 windows 平台出现乱码，尝试执行命令： CHCP 65001*

# $exec 执行任一程序

在 JS 中使用 $exec 执行任一程序，比如：

``` JS $exec
// example 1
$exec('test.py', {
  cwd: './script/Shell',
  cb(data, error){
    if (error) {
      console.error(error)
    } else {
      console.log(data)
    }
  }
})

// example 2
$exec('./hello.sh', {
  cwd: './script/Shell',
  env: {
    name: 'elecV2P'
  },
  cb(data){
    console.log(data)
  }
})

// example 3, 会使用默认浏览器打开对应网页(win)
$exec('start https://github.com/elecV2/elecV2P')
```

## 相关说明

$exec 会调用系统默认程序执行相关文件，所以需提前安装好相关执行环境。
比如，执行 **test.py**，需安装好 Python，并将 test.py 文件放置到 **cwd** 对应目录。

$exec 执行效果类似于直接在命令行下的 cwd 目录执行相关指令。如果出现问题，可以使用系统自带命令行工具在对应目录下，测试命令是否可行。