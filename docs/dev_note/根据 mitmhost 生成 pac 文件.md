### 说明

PAC 文件地址: webUI/pac 。 比如 http://127.0.0.1/pac 或者 https://xx.xxx(你的webUI地址)/pac

*[PAC 是什么？](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Proxy_servers_and_tunneling/Proxy_Auto-Configuration_PAC_file)*

### 使用

在使用设备的代理设置部分，选择 PAC 自动代理，填写上面的 PAC 文件地址，保存即可。

### 功能

根据当前 mitmhost 列表自动生成 PAC 文件。

#### 提醒

- 如果 webUI 开启了安全访问，在填写 PAC 链接时注意带上 token，建议设置临时 token 进行访问。比如 http://192.168.1.101/pac?token=1234
- 如果更新 mitmhost 列表后 PAC 文件没有更新，建议在 PAC 链接后添加任意参数进行缓存更新。比如 http://192.168.1.1/pac?token=1234&update=154
- 如果设置 PAC 后无法联网，请确认代理地址及端口是否填写正确，以及 elecV2P 的 MITM 功能是否开启