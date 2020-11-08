## elecV2P 高级篇

*新手慎用*

# 1. minishell

小型 shell 网页客户端，可执行一些简单的 shell 命令。比如：**ls**、 **rm -rf \***、 **reboot** 等

![minishell](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/minishell.png)

## 开启方式

在 script/list/config.json 添加

``` JSON
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

## 一些指令

- cls/clear   // 清空屏幕
- cwd         // 获取当前工作目录
- cd xxx      // 更改当前工作目录到xxx

# 2. $exec 执行任一程序

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

// example 3, 会使用默认浏览器打开对应网页(windows 平台)
$exec('start https://github.com/elecV2/elecV2P')
```

## 相关说明

为了方便直接调用 **Shell** 文件夹下的程序，建议将该目录添加到系统环境变量的 **PATH** 中。

$exec 会调用系统默认程序执行相关文件，所以需提前安装好相关执行环境。
比如，执行 **test.py**，需安装好 Python，并将 test.py 文件放置到 **cwd** 对应目录。

$exec 执行效果类似于直接在命令行下的 cwd 目录执行相关指令。如果出现问题，可以使用系统自带命令行工具在对应目录下，测试命令是否可行。

# 3. 限制 IP 访问后台管理界面

设置位于 webUI -> setting 页面

![limitip](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/limitip.png)

默认处于关闭状态，所有 IP 可访问。

打开后，白名单的优先级高于黑名单。比如，当同个 IP 同时出现在白名单和黑名单中时，以白名单为准，即：可访问。

IP 以换行符或英文逗号(,)作为分隔。在黑名单中可用单个星号字符(\*)表示屏蔽所有不在白名单中的 IP。

选择保存所有设置后，IP 列表会保存到 script/Lists/config.json 文件，重启服务后自动应用。

可通过在请求中添加 **token=webhook token** 的参数绕过黑名单，以防不小心把自己屏蔽，而无法更改的情况。或者在非允许的 IP 网络中进行临时访问。
例如：https://elecv2p.youser.com/?token=a8c259b2-67fe-4c64-8700-7bfdf1f55cb3 (服务器的 webhook token) , 或者

``` JS
fetch('/config', {
  method: 'put',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "token": "a8c259b2-67fe-4c64-8700-7bfdf1f55cb3",
    "type": "config",
    "data": {
      "SECURITY": {"status": false}
    }
  })
}).then(res=>res.text()).then(s=>console.log(s))
```