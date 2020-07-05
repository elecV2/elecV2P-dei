```
最近更新： 2020-7-5
适用版本： 2.0.2
```

## 执行时间

数据返回前 beforeSendResponse。

rewrite 列表的优先级高于 rules 规则列表。

## 格式

```
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