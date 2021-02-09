```
最近更新： 2021-02-09
适用版本： 3.1.7
```

## 通知方式

- FEED RSS 订阅
- IFTTT WEBHOOK
- BARK 通知
- 自定义通知

### Feed rss 订阅

地址为网页端口（默认为 80） + /feed
例如：**http://127.0.0.1/feed**

然后使用 rss 阅读软件直接订阅即可。

*局域网内的 RSS 只能在局域网内查看，有外网地址才能实现远程订阅*

### IFTTT webhook

IFTTT - If This Then That, 官方网站为：https://ifttt.com/

![](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/iftttnotify.png)

1. 在手机上下载 ifttt 软件，注册登录，用于接收实时通知。
2. 在 ifttt 中搜索 webhook，或访问 https://ifttt.com/maker_webhooks/ ，添加 webhook 服务
3. 在 ifttt 中新建一条规则，if **Webhook** than **Notifications**。 webhook 的 Event Name（事件名称）设置为: **elecV2P**

![](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/setiftttm.jpg)

4. 在 ifttt 的 webhook setting edit 中找到对应的 **key**, 然后把 key 填写到 webUI 后台管理页面的 setting 对应位置

![](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/setifttt.png)

* 如果想通过 telegram 接收信息，则设置： if **Webhook** than **telegram**
* 通过邮箱接收： if **Webhook** than **email**
* 像其他的短信通知，iOS Reminders，发送到网盘Drive/evernote/twiter/Alexa 等等，都可以通过类似的方式去实现

#### 测试设置是否成功

在 webUI -> JSMANAGE 页面的 JS 编辑框中复制以下代码：

``` JS
// 所有通知测试
$feed.push('elecV2P notification', '这是一条来自 elecV2P 的通知', 'http://192.168.1.101')

// IFTTT 通知单独测试
$feed.ifttt('IFTTT notification', '来自 elecV2P', 'https://github.com/elecV2/elecV2P')
```

然后点击测试运行（快捷键 ctrl+enter），如果能收到通知，表示设置成功。如果没有收到，看程序的运行日志，对照上面的步骤检查设置是否正确。

### BARK 通知

iOS 端通知 APP，下载地址：https://apps.apple.com/app/bark-customed-notifications/id1403753865
Github 地址：https://github.com/Finb/Bark

下载 BAKR APP 获取 KEY，然后填写到 webUI -> SETTING 界面的 BARK KEY 位置。

* v2.9.3 更新支持 BARK 使用自定义服务器

开启方式：在 BARK KEY 位置填写完整的服务器地址，比如 https://your.sever.app/youbarkkeylwoxxxxxxxkUP/

### 自定义通知

通过不同平台提供的 API 接口，实现实时通知。以 **SERVER 酱** 为例，根据官方（http://sc.ftqq.com/ ）说明，可得到一个类似：http://sc.ftqq.com/SCKEY.send 的地址，然后 POST 的方式提交数据，数据格式为：

```
{
  "text": `$title$`,
  "desp": `$body$可以随便加点自定义文字[链接]($url$)`
}
```

其中 **$title$**, **$body$**, **$url$** 三个字段分别表示原本通知的标题/主体和链接。

![](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/custnotify.png)

上图所示为通过自定义设置，实现SERVER 酱的通知。

如果是通知 GET 的请求方式进行通知，则直接在 URL 中使用这三个参数，例如：https://sc.ftqq.com/yourSCKEY.send?text=$title$

如果要使用其他的通知方式，请根据其他通知平台提供的 API 说明文档，自行进行设置。

例如使用 telegram bot 通知，通知链接：https://api.telegram.org/bot你的botapi/

选择 POST 方式，内容如下：

```
{
  "method": "sendMessage",
  "chat_id": 你的TG userid,
  "text": `$title$\n$body$\n$url$`
}
```

- *数据最终提交格式，会自动进行判断。如果是 JSON 格式，会自动以 application/json 的方式提交。*
- *通常 API 都会有字符长度限制，比如 TG bot 的限制长度 4096，在使用时可能需要注意。*

## 默认通知内容

- 任务开始/暂停/删除
- 倒计时任务完成
- JS 运行设定次数（默认 50）

## JS 调用 - 自定义通知

### 关键字： $feed

- $feed.push(title, description, url)
*添加一个 rss item 及 通知*
*url 可省略*

``` JS example
$feed.push('elecV2P notification', '这是一条来自 elecV2P 的通知', 'https://github.com/elecV2/elecV2P')

// 发送一条 IFTTT 通知。（先设置好 ifttt webhook key）
$feed.ifttt('title', 'description', 'https://github.com/elecV2/elecV2P-dei')   
// 发送一条 BARK 通知
$feed.bark('Bark notification', 'a bark notification', 'https://t.me/elecV2')
// 发送一条自定义通知
$feed.cust('elecV2P customize notification', `一条自定义通知。\na customize notification` , 'https://t.me/elecV2')
```

### 其他说明

- 当通知标题（title）中含有 **test** 关键字时，自动跳过，不添加通知内容。（方便调试）
- 当通知主体（description）内容长度超过一定数值（默认 1200）时，会自动进行分段通知。
  - 默认 feed 通知不限制字符长度，不分段。
  - 单独调用 （$feed.ifttt/$feed.bark/$feed.cust）时也不分段通知。
  - 只有默认通知和使用 **$feed.push**，在字符超过设定值时才会分段发送。该设定值可在 SETTING 界面修改，0 表示始终不分段。