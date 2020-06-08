## 简介

一款基于 anyproxy 的网络工具。

### 基础功能

- 获取/查看  网络请求
- 拦截/自定义网络请求
- MITM（需安装证书）
- JS 脚本运行
- 定时任务（倒计时/cron 定时）
- 定时任务通知

## 安装/install

### nodejs （不推荐）

``` sh
yarn
yarn start
```

如果要在移动设备上使用 MITM 功能，可能需要手动将 `node_modules/node-easy-cert/dist/certGenerator.js` 第 30 行的 **1024** 改为 **2048**

``` js
function getKeysAndCert(serialNumber) {
  var keys = forge.pki.rsa.generateKeyPair(1024);    // before
  var keys = forge.pki.rsa.generateKeyPair(2048);    // before
  ...
}
```

*docker 已进行修改，无需进行以上操作*

### docker

``` sh
docker run --restart=always -d --name elecv2p -p 80:80 -p 8001:8001 -p 8002:8002 -p 8005:8005 elecv2/elecv2p
```

### docker-compose （推荐）

docker-compose.yaml
```
version: '3.7'
services:
  elecv2p:
    image: elecv2/elecv2p
    restart: always
    environment:
      - TZ=Asia/Shanghai
    ports:
      - "8100:80"
      - "8101:8001"
      - "8102:8002"
      - "8005:8005"
    volumes:
      - "/elecv2p/JSFile:/usr/local/app/runjs/JSFile"
      - "/elecv2p/Lists:/usr/local/app/runjs/Lists"
      - "/elecv2p/Store:/usr/local/app/runjs/Store"
```

``` sh
docker-compose up -d
```

*建议在本地运行（旁路由/软路由 等）*

## 端口说明

- 80：    软件主界面。添加规则/JS 文件管理/定时任务管理/MITM 证书 等
- 8001：  anyproxy 代理端口
- 8002：  anyproxy 连接查看
- 8005：  websocket 通信


## 使用说明

### 根证书相关 - https 解密

#### 安装证书

选择以下任一种方式下载证书，然后安装信任证书

- 直接打开 :80/crt
- :80 -> MITM -> 安装证书
- :8001 -> RootCA

根证书位于 `$HOME/.anyproxy/certificates` 目录，可用自签证书替换

#### 启用自签证书

任选一种方式

- 将根证书（rootCA.crt/rootCA.key）复制到本项目 **rootCA** 目录，然后 :80 -> MITM -> 启用自签证书
- 直接将根证书复制到 **$HOME/.anyproxy/certificates** 目录下

使用新的证书后，记得重新下载安装信任，并清除由之前根证书签发的域名证书。

### rules - 网络请求修改规则

![rules](https://raw.githubusercontent.com/elecV2/elecV2P/master/res/rules.png)

详见 [docs/rules.md]() （龟速完成中）

## 定时任务

![task](https://raw.githubusercontent.com/elecV2/elecV2P/master/res/task.png)

目前支持两种定时方式：
- 倒计时
- cron 定时

### 时间格式：

- 倒计时

时间格式：30 999 3 （倒计时秒数 重复次数 随机秒数）

三个以空格分开的数字，分别代表 **倒计时秒数 重复次数 随机秒数**，后两项可省略。

当重复次数大于等于 **999** 时，无限循环。

示例： 400 8 10 ，表示倒计时40秒，随机10秒，所以具体倒计时时间位于 40-50 秒之间，重复运行 8 次

- cron 定时 

时间格式：* * * * * * （六位 cron 时间格式）

### 可执行任务类型

- 运行 JS
- 开始/停止 其他定时任务

## 通知

目前支持两种通知模式： feed/rss 和 ifttt

feed/rss 地址为 :80/feed。

ifttt 通知需先在设置（setting）面板添加 key。目前 ifttt 通知是整合到 feed 模块里面的，即两项通知内容基本一样。

通知内容：

- 定时任务开始/结束
- 定时任务 JS 运行次数（默认运行 50 次通知一次）

### 简单声明

该项目仅用于学习交流，任何使用一切后果自负。

## 贡献

- [anyproxy](https://github.com/alibaba/anyproxy)
- [Ant Design Vue](https://www.antdv.com)
- [node-rss](https://github.com/dylang/node-rss)

## Todo

- [ ] JS 添加 feed 通知 $feed
- [ ] lists 合理性检测
- [ ] 定时任务 时间合理检测
- [ ] 定时任务 打开 url
- [ ] webpack 分包
- [ ] lists 订阅

## Done

- [x] 任务 运行 log 返回
- [x] 客户端 websocket
- [x] logger 添加 cb(websocket)
- [x] list 更改 重载
- [x] logger level 统一管理
- [x] antd 精简
- [x] vue 分拆重构
- [x] web UI
- [x] config 配置对象
- [x] mitmhost.list
- [x] schedule repeat 无数次
- [x] 任务执行不影响原始任务数据
- [x] utils 内容整理
- [x] schedule 任务多元化
- [x] clog 前缀自定义，多参数输入  .header
- [x] clog 级别控制 .debug, .info, .error
- [x] logger 库初级
- [x] runJSFile Post/Get cb 处理
- [x] axios callback/response 处理
- [x] surger/qx $request/$response 兼容
- [x] 单个域名 对应 user-agent
- [x] rootCA 清空
- [x] js 编写 默认模板
- [x] filter.list 编辑
- [x] help 页面（延迟加载）
- [x] 设置页面 help
- [x] 保存规则下移
- [x] rule.list 编辑
- [x] 保存规则去空，去无对应 js
- [x] js 手动编写
- [x] js 内容查看管理
- [x] filter.list 生成
- [x] js 删除
- [x] menu lists （小图标）（请求信息查看/保存列表/。。。）
- [x] rule.list 订阅（更新hook)(rewrite)
- [x] js 远程下载
- [x] 根证书只同步，不上传
- [x] js 文件上传
- [x] 同步证书/清空历史已签发证书

# Project

- 说明文档 [progressing...]
- 通知细分自定义
- 自签证书自定义生成
- request 转发到 local port/remote server [progressing..., cancelled]
- anyproxy 替换，使用原生代码，增强可定制性