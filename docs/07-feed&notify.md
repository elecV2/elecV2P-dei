```
最近更新： 2020-7-27
适用版本： 2.2.7
```

## 通知方式

- feed rss 订阅
- ifttt webhook

### Feed rss 订阅 

地址为网页端口（默认为 80） + /feed
**:80/feed**

使用各种 rss 阅读软件直接订阅即可。

### ifttt webhook 

1. 在手机上下载 ifttt 软件，用于接收通知。
2. 搜索 webhook，或访问 https://ifttt.com/maker_webhooks/ ，添加 webhook 服务
3. 在手机上新建一条 ifttt 规则，if **Webhook** than **Notifications**
   - webhook Event Name: **elecV2P**
4. 在 webhook setting edit 中找到对应的 **key**, 然后把 key 填写到 webUI setting 对应位置

## 通知内容

- 任务开始/暂停/删除/及结束
- JS 总运行到一定次数（默认 50）

### 其他说明

当通知主题含有 **test** 关键字时，自动路过，不添加通知内容。（方便调试）

## JS 调用 - $feed

- $feed.push(tile, description, url) - 添加一个 rss item

``` JS example
$feed.push('elecV2P notification', '这是一条来自 elecV2P 的通知', 'https://github.com/elecV2/elecV2P')
```

- $feed.ifttt(tile, description, url) - 发送一条 ifttt 通知

*先设置好 ifttt webhook key*

*url 可省略*