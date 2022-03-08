## 主要用于一些测试和备份（仅供参考）

### [JSTEST](https://github.com/elecV2/elecV2P-dei/tree/master/examples/JSTEST)

一些测试 JS 文件，比如：

- [boxjs.ev.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/boxjs.ev.js) \- boxjs elecV2P 兼容版 (v3.2.3 版本后可直接使用 chavyleung 的原版)

![](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/res/boxjs-test.png)

- [github-subdownload.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/github-subdownload.js) \- github 子目录文件下载
- [exam-rss.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/exam-rss.js) \- 使用 cheerio 解析 rss 实现限免软件推送
- [reboot.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/reboot.js) \- 通过 JS 重启服务器
- [evui-dou.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/evui-dou.js) \- 在前端网页显示京东豆收支图表

![](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/res/evuidou.png)

等等

*如果有其他比较好玩或有用的脚本，欢迎 Pull Request*

### efh 实际应用系列

关于 efh 格式文件的说明，参考说明文档 [08-logger&efss.md](https://github.com/elecV2/elecV2P-dei/blob/master/docs/08-logger&efss.md) 中的相关部分。

- [markdown.efh](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/markdown.efh) \- 一个简单的 markdown 阅读器

- [其他 efh 脚本](https://github.com/elecV2/elecV2P-dei/tree/master/examples/JSTEST/efh)

### [TGbotonCFworker.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/TGbotonCFworker.js) - 通过 TG bot 控制 elecV2P

2.0 版本(新增上下文执行环境): https://github.com/elecV2/elecV2P-dei/blob/master/examples/TGbotonCFworker2.0.js

![](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/res/tgbot.png)

可实现功能：（所有操作可在 telegram 上完成）
- 运行 JS
- 获取/删除 日志
- 获取服务内存占用信息
- 获取定时任务信息
- 开始/暂停 定时任务
- 删除/保存 定时任务
- 执行 shell 指令
- store/cookie 常量管理

前提: elecV2P 服务器可通过外网访问

具体使用见脚本内注释内容