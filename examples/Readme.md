## 主要用于一些测试和备份。（仅供参考）

### JSTEST

一些测试 JS 文件，比如：
- [boxjs.ev.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/boxjs.ev.js) \- boxjs elecV2P 兼容版
- [exam-rss.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/exam-rss.js) \- 使用 cheerio 解析 rss 实现限免软件推送
- [exam-tasksub.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/exam-tasksub.js) \- 通过 webhook 批量添加定时任务
- [reboot.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/reboot.js) \- 通过 JS 重启服务器
- [evui-dou.js](https://github.com/elecV2/elecV2P-dei/blob/master/examples/JSTEST/evui-dou.js) \- 在前端网页显示京东豆收支图表

等等

### TGbotonCFworker.js - 通过 TG bot 控制 elecV2P

可实现功能：（所有操作可在 telegram 上完成）
- 运行 JS
- 获取/删除 日志
- 获取服务内存占用信息
- 获取定时任务信息
- 开始/暂停 定时任务
- 删除/保存 定时任务

前提： elecV2P 服务器可通过外网访问

具体使用见 **TGbotonCFworker.js** 注释内容

TGbotonCFworker2.0.js 新增上下文执行环境。