```
最近更新: 2021-10-23
适用版本: 3.5.1
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/Advanced.md
```

## elecV2P 进阶使用篇

# 限制 IP 访问后台管理界面

设置位于 webUI->SETTING 页面

![limitip](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/limitip.png)

默认处于关闭状态，所有 IP 可访问。

打开后，白名单的优先级高于黑名单。比如，当同个 IP 同时出现在白名单和黑名单中时，以白名单为准，即: 可访问。
IP 以换行符或英文逗号(,)作为分隔，保存实时生效。
在黑名单中可用单个星号字符(\*)表示屏蔽所有不在白名单中的 IP，建议在网络部署的环境下使用。

IP 屏蔽后，可通过在请求链接中添加 **?token=webhook token** 的参数来绕过屏蔽，例如: http://你的服务器地址/?token=a8c259b2-67fe-4c64-8700-7bfdf1f55cb3 (服务器的 WEBHOOK TOKEN，首次启动时为随机值)

- 首次通过 token 访问后会在浏览器端保存一个 cookie，之后访问时不再需要 token（v3.5.1）
- cookie 默认有效期 7 天，在后面添加 ?token=xxx&cookie=long，可延长到 365 天
- 如果不想留下 cookie，请使用无痕模式（在使用他人或公共设备时

# minishell

小型 shell 网页客户端，可执行一些简单的 shell 命令。比如: **ls**、 **python3 -V**、 **rm -rf \***、 **reboot** 等

![minishell](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/minishell.png)

## 开启方式

- v3.4.4 增加使用 webhook 快速开启关闭的方式

```
// 查看当前 minishell 状态
http://127.0.0.1/webhook?token=xxxxbbff-1043-XXXX-XXXX-xxxxxxdfa05&type=devdebug&get=minishell

// 打开
http://127.0.0.1/webhook?token=xxxxbbff-1043-XXXX-XXXX-xxxxxxdfa05&type=devdebug&get=minishell&op=open

// 关闭
http://127.0.0.1/webhook?token=xxxxbbff-1043-XXXX-XXXX-xxxxxxdfa05&type=devdebug&get=minishell&op=close
```

- v3.4.4 之前打开方式

方法一: 在 script/Lists/config.json 中添加下面的参数，然后重启服务。

``` JSON
{
  // ... 其他保持不变
  "minishell": true
}
```

方法二: 在 webUI 页面，打开浏览器开发者工具，在 Console 中执行以下代码，然后刷新一下页面。
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

再打开 webUI，在 SETTING 界面的右上角有一个蓝黑的小圈，点击即可打开 **minishell** 交互台。

## 基础使用

minishell 基于 nodejs 的 child_process exec。另外做了一些修改，比如，跨平台的命令转换。

在 windows 平台输入 **reboot** 命令，会自动转化为 **restart-computer**，相当于将 linux 和 windows 平台的 shell 命令进行了简单的同化统一。
更多跨平台命令同化转换中...

另外，如果指令中包含 http 链接，将会自动下载后再执行，比如命令:

``` sh
python3 -u https://raw.githubusercontent.com/elecV2/elecV2P/master/script/Shell/test.py
# 通过这种方式可以实现直接执行远程脚本
# 部分常用网络命令已排除下载，比如: curl/wget/git/start/you-get/youtube-dl 等
# 更多说明，可参考 06-task.md Shell 指令 部分
```

*如果在 windows 平台出现乱码，尝试执行命令: CHCP 65001*

## 特殊指令

- cls/clear   // 清空屏幕
- cwd         // 获取当前工作目录
- cd xxx      // 更改当前工作目录到xxx
- docs        // 打开此 Github 说明页面(v3.4.7)

### 其他说明

- *minishell 的通信基于 websocket，确保执行任何命令前 websocket 是成功连接的*
- *单击上方日志输出部分，停止自动滚动。单击下方命令输入部分，开启自动滚动*
- *minishell 命令执行使用默认的 timeout 60000ms(1 分钟)。如需执行长时间命令，尝试使用下面的 $exec 执行*

## 使用 $exec 执行任一程序

在 JS 中使用 $exec 执行 shell 命令，通过此方式可以在 JS 中调用其他任意语言的程序，比如运行 python 或 .sh 文件等，例如:

``` JS $exec
// example 1 执行 python 程序
$exec('python test.py', {
  cwd: './script/Shell',      // 命令执行目录
  timeout: 5000,              // 设置 timeout。 0: 表示不限制
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

### 相关说明

$exec 会调用系统默认程序执行相关文件，所以需提前安装好相关执行环境。
比如，执行 **test.py**，需安装好 Python，并将 test.py 文件放置到 **cwd** 对应目录。

$exec 执行效果类似于直接在命令行下的 cwd 目录执行相关指令。如果出现问题，使用系统自带命令行工具在对应目录下，测试命令是否可行。

更多说明参考: [04-JS.md](https://github.com/elecV2/elecV2P-dei/tree/master/docs/04-JS.md) $exec 部分

## 其他一些操作

- 开启 anyproxy 代理 websocket 请求: 在 script/Lists/config.json 中 anyproxy 部分添加

``` JSON
{
  "anyproxy": {
    // ... 前面保存不变,
    "wsIntercept": true
  }
}
```

- 查看 ANYPROXY 当前所启用的规则

http://127.0.0.1/webhook?token=xxxxbbff-1043-XXXX-XXXX-xxxxxxdfa05&type=devdebug&get=rule

- 查看当前连接客户端简易信息(v3.5.0)

http://127.0.0.1/webhook?token=xxxxbbff-1043-XXXX-XXXX-xxxxxxdfa05&type=devdebug&get=wsclient