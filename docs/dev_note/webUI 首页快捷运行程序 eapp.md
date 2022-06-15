### 基础说明

![EAPP](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/eapp_overview.png)

一个类似于手机主界面的模块，点击图标快速执行部分功能。

暂命名为 eapp - elecV2P application, 大写 EAPP 或 eAPP

### 功能

- 运行 JS 脚本
- 运行 efh 文件
- 执行 shell 指令
- 打开某个网址

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
}]
```

hash 生成算法，md5(NAME + TYPE + TARGET)。

当 logo 省略时，将根据生成的 hash 值自动生成 logo，具体的生成算法参考 https://elecv2.github.io/#算法研究之通过字符串生成艺术图片

### 执行

EAPP 应用类型 js 和 shell 点击后直接运行，运行日志将实时返回前台。efh 及 打开网址两个类型的应用将在新标签页中打开。

![EAPP 编辑](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/eapp_overview.png)

打开编辑模式后，再次点击图标可编辑 EAPP 内容，点击右上角的 X 按钮删除应用。

### 问题

- efh 远程文件（done
  - wbrun qeury target
- JS 及 shell 运行时如何显示（done
  - 引入日志模块
  - 运行中 logo 提示

### 待添加

- 小组件

### elecV2P 全部说明文档

https://github.com/elecV2/elecV2P-dei/tree/master/docs