### 基础说明

首页做一个类似于手机主界面的模块，点击图标直接快速运行部分功能。

暂命名为 eapp - elecV2P application, 大写 EAPP 或 eAPP

### 功能

- 运行 JS 脚本
- 运行 efh 文件
- 执行 shell 指令
- 打开某个网址

### 格式

``` JSON
[{
  "name": "显示名称",
  "logo": "url/to/xxx.png",
  "type": "efh",
  "target": "test.efh",
  "hash": "md5hash",
}, {
  "name": "打开网址",
  "type": "url",
  "target": "https://github.com/elecV2/elecV2P"
}, {
  "name": "Shell 指令",
  "type": "shell",
  "target": "node -v"
}]
```

efh 及 打开新标签可以直接在新标签页打开

### 实现

hash 值

``` JS
hash = md5(NAME + TYPE + TARGET)
```

### 问题

- efh 远程文件
- JS 及 shell 运行时如何显示
  - 引入日志模块
  - 运行中 logo 提示

### 可能添加

- 小组件