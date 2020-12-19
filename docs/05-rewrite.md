```
最近更新： 2020-12-18
适用版本： 2.9.2
```

## 简述

rewrite 规则是 rules url 匹配，在数据返回前通过 JS 修改的简化规则，完全可以通过 RULES 实现相同功能。
rewrite 列表的优先级高于 rules 规则列表。

## 执行时间

数据返回前 beforeSendResponse。

## 格式

该列表保存于 **./script/Lists/rewrite.list**，格式如下：

```
// 注释
# 另一行注释
[rewrite] // 也可以理解为一行注释
sub url(订阅地址)
url(regex) file.js
```

### 订阅

sub 开头，空格后 + 订阅地址

> sub https://www.example.com/whatever/rewrite.list

### 基础格式

url file.js

```
^https://api\.rrad\.tv/v3pl/index/(channel|coice)$ RRad.js
^https?:\/\/httpbin\.org/get https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/JSTEST/0body.js
```