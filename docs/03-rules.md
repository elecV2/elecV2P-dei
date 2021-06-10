```
最近更新: 2021-05-23
适用版本: 3.3.8
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/03-rules.md
```

## 准备工作

- **再使用 RULES/REWRITE 相关功能前，请确定 ANYPROXY 已打开**
- 已正确将网络请求代理到 ANYPROXY 端口
- 匹配 https 请求请先添加 MITM host，普通 http 请求无需添加
- *首次命中 https 请求时，系统需要生成中间证书，可能会稍长一点时间返回结果*

## modify 规则集 格式说明

|   匹配方式   |    匹配内容（正则）   |  修改方式 |       修改内容      |  修改时间
 :-----------: | --------------------- | :-------: | ------------------- | ----------
| url          | ^https://api.b.com/v2 | JS        | file.js             |  前(req)
| host         | api.bilibili.com      | useragent | iPhone 6s           |  后(res)
| useragent    | neteaseMusic / aliApp | block     | reject|tinyimg      |
| reqmethod    | GET/POST/PUT/DELETE   | $HOLD     | 30
| reqbody      | queryPara/word string |           |
| resstatus    | 200 / 404 / 301 / ... |           |
| restype      | text/html / text/json | -----     |
| resbody      | Keyword(string)       | all - JS  |

- *实际使用中匹配方式和修改方式可以任意搭配*

### 匹配方式

```
url             // 匹配 url 
host            // 匹配 url host 部分
useragent       // 匹配 User-Agent 
reqmethod       // 匹配 网络请求方式
reqbody         // 匹配 请求体（body）
resstatus       // 匹配 请求返回的状态码
restype         // 匹配 返回的数据类型
resbody         // 匹配 返回的数据内容
```

### 修改方式

#### JS

通过 JS 脚本修改网络请求数据，对应修改内容为 JS 文件名或远程 JS 链接。

从该模块运行 JS，默认会添加 $request，$response(**数据返回前**) 两个变量，具体参数如下：

- $request.headers, $request.body, $request.method, $request.hostname, $request.port, $request.path, $request.url
- $response.headers, $response.body, $response.statusCode

#### 307 重定向

对应修改内容为重定向目标网址

#### 阻止

reject: 返回状态码 200, body 为空。 
tinyimg: 返回状态码为 200, body 为一张 1x1 的图片

#### $HOLD

将原网络请求的 header 和 body 发送到前端网页进行修改处理，然后将修改后的数据直接发送给服务器/客户端。

对应修改内容表示等待前端修改数据的时间，单位秒。当为 **0** 时，表示一直等待。如果为其他值且超时时则直接使用原数据进行下步操作。

使用该修改方式时，请尽量使用比较详细的匹配规则，匹配单一网络请求，否则后面的 $HOLD 请求会覆盖前面的数据。

**2020.7.16 2.1.0 更新**

$HOLD request reject - 直接返回当前数据

返回默认状态码: 200

数据包含两部分: header 和 body

#### User-Agent

修改请求 header 中的 User-Agent。

默认 User-Agent 可在 webUI->SETTING->网络请求相关设置进行管理修改

### 修改时间

网络请求匹配时间

#### 网络请求前

beforeSendRequest

#### 数据返回前

beforeSendResponse

## 源文件格式

RULES 规则列表保存于 **./script/Lists/default.list**，实际格式为严格的 JSON 类型（不包含任何注释）。
*（参考: https://raw.githubusercontent.com/elecV2/elecV2P/master/script/Lists/default.list ）*

``` JSON
{
  "rules": {
    "note": "elecV2P RULES 规则列表",  // 
    "list": [
      {
        "mtype": "url",
        "match": "adtest",
        "ctype": "block",
        "target": "reject",
        "stage": "req"
      },
      {
        "mtype": "url",
        "match": "httpbin.org/get\\?hold",
        "ctype": "hold",
        "target": "0",
        "stage": "req",     // enable 可省略。仅在 enable 为 false 的时候表示不启用
        "enable": true
      }
    ]
  }
}
```

*如非必要，请不要手动修改 list 源文件*