```
最近更新: 2022-10-31
适用版本: 3.7.4
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/Advanced.md
```

## elecV2P 进阶使用篇

# 安全访问相关设置

位于 webUI->SETTING/设置相关 页面

![limitip](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/security.png)

- 默认处于关闭状态，所有 IP 可访问
- 该限制仅对 webUI 端口（默认 80）有效，对 8001/8002 对应端口无效
- 白名单的优先级高于黑名单。比如，当同个 IP 同时出现在白名单和黑名单中时，以白名单为准，即: 可访问
- IP 以换行符或英文逗号(,)作为分隔，保存实时生效
- 在黑名单中可用单个星号字符(\*)表示屏蔽所有不在白名单中的 IP，建议在公网部署的情况下使用
- 设置**仅开放 webhook 接口**后，可通过 webhook?token=xx&type=security&op=put&webhook_only=0 来关闭

IP 屏蔽后，可通过在请求链接中添加 **?token=webhook token** 的参数来绕过屏蔽，例如: http://你的服务器地址/?token=a8c259b2-67fe-4c64-8700-7bfdf1f55cb3 (服务器的 WEBHOOK TOKEN，首次启动时为随机值)

- 首次通过 token 访问时会在浏览器端生成一个 cookie，之后访问时不再需要 token（v3.5.1）
- cookie 默认有效期 7 天，在后面添加 ?token=xxx&cookie=long，有效期为 365 天
- 如果不想留下 cookie，请使用无痕模式（在使用他人或公共设备时
- 访问时后面添加 ?cookie=clear 删除当前设备的授权信息（v3.6.4）
- 在设置中取消 **允许 cookie 授权访问** 后，所有 cookie 将不可访问（v3.6.6）

## 临时访问 TOKEN（v3.7.4 增加

增加临时可访问 token，可限制访问路径。作用：

- EFSS 临时文件分享
- 部分脚本、日志临时分享
- 非安全网络下临时访问
- 其他

![temp_token](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/temp_token.png)

1. 访问 token。使用示例：efss/hi?token=xxxx, /logs?token=xxxxx
2. 限制可访问的路径。匹配方式 new RegExp(path, 'i').test(req.path)。留空表示不限制
3. 备注信息
4. 授权访问次数统计

注意事项：

- 当设置和 webhook token 相同值时，会自动舍弃该临时 TOKEN
- 当设置为空值时，会自动舍弃
- 当临时 token 有相同项时，会覆盖前一项
- 临时访问 token 同样会生成 cookie
  - cookie 有效期同上 webhook token
  - cookie 可访问路径同对应 token 的可访问路径

### 安全访问检测逻辑

1. 检测安全访问是否开启
  - 当没有开启时，允许所有请求
  - 当开启时，进入下一步
  - */favicon.ico 不进行安全检测*
2. 检测是否启用 webhook_only 选项（仅开放 webhook 接口
  - 当启用时，仅允许 /webhook 请求，其他请求返回 403 无授权访问提示信息
  - 当没有启用时，进入下一步
3. cookie 检测
  - 检测通过，允许请求
  - 检测失败，进入下一步
4. token 检测
  - 检测通过，允许请求。并将设置一个有效期为 7 或 365 天的 cookie
  - 检测失败，进入下一步
5. IP 检测
  - 检测通过，允许请求（不会设置 cookie 信息
  - 检测失败，返回 403 无授权访问提示信息

# minishell

小型 shell 网页客户端，可执行一些简单的 shell 命令。比如: **ls**、 **python3 -V**、 **rm -rf \***、 **reboot** 等

![minishell](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/minishell.png)

## 开启方式

- v3.4.4 之后使用 webhook 快速开启关闭

```
// 查看当前 minishell 状态
http://127.0.0.1/webhook?token=xxxxbbff-1043-XXXX-XXXX-xxxxxxdfa05&type=devdebug&get=minishell

// 打开
http://127.0.0.1/webhook?token=xxxxbbff-1043-XXXX-XXXX-xxxxxxdfa05&type=devdebug&get=minishell&op=open

// 关闭
http://127.0.0.1/webhook?token=xxxxbbff-1043-XXXX-XXXX-xxxxxxdfa05&type=devdebug&get=minishell&op=close
```

- v3.4.4 之前的打开方式

方法一: 在 script/Lists/config.json 中添加下面的参数，然后重启 elecV2P。

``` JSON
{
  // ... 其他保持不变
  "minishell": true
}
```

方法二: 在 webUI 页面，打开浏览器开发者工具，在 Console 中执行以下代码，然后刷新页面。

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

再打开 webUI，在 SETTING/设置相关 界面的右上角有一个蓝黑的小圈，点击即可打开 **minishell** 交互台。

## 基础使用

- minishell 的通信基于 websocket，确保执行任何命令前 websocket 是成功连接的
- minishell 的执行基于 nodejs 的 **[child_process exec](https://nodejs.org/api/child_process.html)**
- minishell 命令执行默认 timeout 为 60000ms(1 分钟)。可在结尾增加 -timeout=0 进行调整

elecV2P 对一些简单的命令会自动进行跨平台转换。比如，在 windows 平台输入 **ls** 命令，会自动转化为 **dir**。**reboot** 自动转化为 **restart-computer** 等。
更多跨平台命令自动转换持续添加中，欢迎反馈。

另外，如果指令中包含 http 链接，将会自动下载后再执行，比如命令:

``` sh
python3 -u https://raw.githubusercontent.com/elecV2/elecV2P/master/script/Shell/test.py
# 通过这种方式可以实现直接执行远程脚本
# 部分常用网络命令已排除下载，比如: curl/wget/git/start/you-get/youtube-dl 等
# 更多说明，可参考 06-task.md Shell 指令 部分
```

*如果在 windows 平台出现乱码，尝试执行命令: CHCP 65001*

## 特殊指令

- cls/clear   // 清空屏幕日志
- cwd         // 获取当前工作目录
- cd xxx      // 更改当前工作目录到xxx
- docs        // 打开此 minishell 说明页面(v3.4.7)
- exit        // 最小化 minishell 界面（在子进程交互中输入时表示结束子进程
- run         // RUN 运行指令（v3.6.7 添加

### 快捷按键

- esc         // 清空当前输入命令
- ctrl + l    // 清空屏幕日志
- ctrl + a    // 移动光标到命令开始处
- up/down     // 上下查找历史执行命令
- shift + tab // 移动光标到子进程交互输入框（如果存在的话
- 单击上方日志输出部分，停止自动滚动。单击下方命令输入部分，开启自动滚动


# 其他进阶操作

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