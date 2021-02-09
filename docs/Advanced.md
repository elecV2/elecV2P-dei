## elecV2P 高级篇

*新手慎用*

# 1. minishell

小型 shell 网页客户端，可执行一些简单的 shell 命令。比如：**ls**、 **rm -rf \***、 **reboot** 等

![minishell](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/minishell.png)

## 开启方式

方法一：在 script/list/config.json 中添加下面的参数，然后重启服务。

``` JSON
{
  // ... 其他保持不变
  "minishell": true
}
```

方法二：在 webUI 页面，打开浏览器开发者工具，在 Console 中执行以下代码，然后刷新一下页面。
``` JS
fetch('/config', {
  method: 'put',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "type": "config",
    "data": {
      "minishell": true
    }
  })
}).then(res=>res.text()).then(s=>console.log(s))
```

再打开 webUI， 在 SETTING 界面的右上角有一个蓝黑的小圈，点击即可打开 **minishell** 交互台。

## 基础使用

minishell 基于 nodejs 的 child_process exec。另外做了一些修改，比如，跨平台的命令转换。在 windows 平台输入 **reboot** 命令，会自动转化为 **restart-computer**，相当于简单统一了 linux 和 windows 的 shell 命令。

更多跨平台统一命令持续添加中。

*如果在 windows 平台出现乱码，尝试执行命令： CHCP 65001*

## 一些指令

- cls/clear   // 清空屏幕
- cwd         // 获取当前工作目录
- cd xxx      // 更改当前工作目录到xxx

### 其他说明

- *minishell 的通信基于 websocket，确保执行任何命令前 websocket 是成功连接的*
- *单击上方日志输出部分，停止自动滚动。单击下方命令输入部分，开启自动滚动*

# 2. $exec 执行任一程序

在 JS 中使用 $exec 执行任一程序，比如：

``` JS $exec
// example 1
$exec('test.py', {
  cwd: './script/Shell',      // 命令执行目录
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
例如：http://你的服务器地址/?token=a8c259b2-67fe-4c64-8700-7bfdf1f55cb3 (服务器的 webhook token) , 或者在浏览器开发者工具中执行以下代码

``` JS
fetch('/config', {
  method: 'put',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "token": "a8c259b2-67fe-4c64-8700-7bfdf1f55cb3",           // 服务器的 webhook token。在 webUI->SETTING 界面查看和修改
    "type": "config",
    "data": {
      "SECURITY": {"enable": false}
    }
  })
}).then(res=>res.text()).then(s=>console.log(s))
```