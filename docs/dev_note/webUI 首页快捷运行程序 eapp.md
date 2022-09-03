### 基础说明

![EAPP](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/eapp_overview.png)

一个类似于手机主界面的模块，点击图标快速执行 elecV2P 部分功能。或者作为其他网页应用的一个入口。

暂命名为 eapp - elecV2P application, 大写为 EAPP。

### 功能

- 运行 JS 脚本
- 运行 EFH 文件
- 执行 SHELL 指令
- 打开某个网址
- 前端执行代码 EVALRUN (v3.7.0 添加)

### 格式

``` JSON
[{
  "name": "软更新",
  "logo": "efss/logo/soft_update.png",   // 可省略。省略时将自动生成
  "type": "js",
  "target": "https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/softupdate.js",
  "hash": "md5hash",        // 自动生成
}, {
  "name": "显示名称",
  "logo": "https://raw.githubusercontent.com/elecV2/elecV2P/master/efss/logo/elecV2P.png",
  "type": "efh",
  "target": "https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/JSTEST/efh/notepad.efh",
}, {
  "name": "项目主页",
  "type": "url",
  "target": "https://github.com/elecV2/elecV2P"
}, {
  "name": "Shell 指令",
  "type": "shell",
  "target": "node -v"
}, {
  "name": "交互输入",
  "type": "shell",
  "target": "ls -cwd %ei%"    // v3.6.8 增加 %ei% 占位符，用于简单交互输入。ei(eapp input)
}, {
  "name": "eval 执行",
  "type": "eval",             // v3.7.0 增加使用 eval 函数在前端网页上执行 JS 代码
  "target": "alert('hello elecV2P')"
}]
```

name 对应值可以为任意字符。
logo 对应值为 img src 属性值，显示大小为 60x60，建议使用图片大小 180x180。可以是一个 http 链接，也可以是 efss 目录中的图片。当省略或加载失败时，将根据 hash 值自动生成 logo，具体的生成算法参考自 https://elecv2.github.io/#算法研究之通过字符串生成艺术图片
type 目前支持 **js efh shell url** 四种类型。 v3.7.0 增加 eval
target 为最终执行的内容。
hash 生成算法，md5(NAME + TYPE + TARGET)。

### 执行

**JS 和 SHELL** 类型点击后，将发送一个 POST 请求到后台，执行对应脚本，然后运行日志通过 websocket 返回给前台。

**EFH 和 打开网址** 两个类型的应用将在浏览器的新标签页中打开。

**EVALRUN** 类型，将直接使用 **eval 函数** 在前端网页中执行对应代码。不支持使用文件，只能是纯 JS 原生代码，仅在前端页面中运行。

![EAPP 编辑](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/eapp_overview.png)

打开编辑模式后，再次点击图标可编辑 EAPP 内容，点击右上角的 X 按钮删除应用。

问题反馈 https://github.com/elecV2/elecV2P/issues

### 待添加

- 小组件
- 编辑脚本内容快捷

### 小组件 widget

在首页显示 widget 小工具

## 实现

可能：
- JSX

## 更新/trigger

- 每次打开首页是触发
- cron
- JS 内部控制

### elecV2P 全部说明文档

https://github.com/elecV2/elecV2P-dei/tree/master/docs