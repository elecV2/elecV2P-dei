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