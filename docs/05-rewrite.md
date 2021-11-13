```
最近更新: 2021-10-16
适用版本: 3.5.0
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/05-rewrite.md
```

## 简述

在 elecV2P 中，REWRITE 规则是 RULES 规则特定项的简化版本，匹配效率较高，建议在可使用 REWRITE 的情况下，关闭 RULES 规则集。

## webUI 相关说明

![rewrite](https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/docs/res/rewritenote.png)

- REWRITE 规则的匹配对象为网络请求的 URL，如果是 https 请求，请在 MITM host 中添加对应的解析域名。
- *具体的匹配公式: `(new RegExp('匹配链接正则表达式')).test($request.url)`。*

v3.5.0 添加 **匹配阶段** 选项
- 网络请求前，用于修改网络请求体 request headers/body 等
- 数据返回前，用于修改获取到的内容 response headers/body 等

- 当规则对应重写方式为 (reject|reject-200|reject-dict|reject-json|reject-array|reject-img) 中的某个参数时，表示阻止该网络请求（直接返回相应内容）
- 当规则对应重写方式为 JS 时，表示在通过该 JS 修改该网络请求或返回内容
- JS 的编写参考说明文档 [04-JS.md](https://github.com/elecV2/elecV2P-dei/blob/master/docs/04-JS.md) 或 示例脚本 [0body.js](https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/0body.js)

- 订阅链接必须以 http 或 efss 开头，具体订阅内容参考下面的 **订阅内容格式** 部分
  - http: 表示订阅为远程地址，比如: https://raw.githubusercontent.com/elecV2/elecV2P/master/efss/rewritesub.json
  - efss: 表示直接读取服务器上 EFSS 虚拟目录中的文件，比如 efss/rewritesub.json

- 删除订阅时并不会删除已添加的 MITMHOST 和 TASK
- 所有规则的更改在保存后才正式生效

## 源文件格式

REWRITE 规则列表保存于 **./script/Lists/rewrite.list**，实际格式为严格的 JSON 类型（不包含任何注释）。
*（参考: https://raw.githubusercontent.com/elecV2/elecV2P/master/script/Lists/rewrite.list ）*

``` JSON
{
  "rewritesub": {     // 订阅列表
    "eSubUuid": {
      "name": "elecV2P 重写订阅",
      "resource": "https://raw.githubusercontent.com/elecV2/elecV2P/master/efss/rewritesub.json"
    }
  },
  "rewrite": {       // 规则列表
    "note": "elecV2P 重写规则",   // 关于规则列表的注释。可省略
    "list": [        // 具体规则
      {
        "match": "^https?://httpbin\\.org/get\\?rewrite=elecV2P",   // 网络请求 url 匹配
        "stage": "res",  // 匹配阶段。req: 网络请求前 res: 数据返回前。 v3.5.0 添加
        "target": "https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/0body.js",  // 匹配后使用的 JS 文件
        "enable": true
      }
    ]
  }
}
```

*如非必要，请不要手动修改 list 源文件*

## 订阅内容格式

订阅内容同样为严格的 JSON 类型，不包含任何注释。参考: https://raw.githubusercontent.com/elecV2/elecV2P/master/efss/rewritesub.json

``` JSON
{
  "name": "elecV2P 重写订阅",       // 订阅名称。可省略
  "resource": "https://raw.githubusercontent.com/elecV2/elecV2P/master/efss/rewritesub.json",   // 该订阅的更新地址。可省略
  "type": "rewrite",                // 订阅类型，固定为 rewrite。用于区分 task 订阅，可省略
  "note": "关于该订阅的一些说明（可省略）。该订阅目前仅适用于 elecV2P，与其他软件并不兼容。更详细说明请查看: https://github.com/elecV2/elecV2P-dei/tree/master/docs/05-rewrite.md",
  "author": "https://t.me/elecV2",  // 制作者。可省略
  "bkcolor": "#2fa885",    // 该订阅背景颜色。当省略时，将随机生成。可使用 url(http://xxxx.jpg)
  "mitmhost": [      // 和重写规则相关的 mitmhost。可省略。
    "test.com", "httpbin.org"
  ],
  "list": [       // 重写规则列表
    {
      "match": "https:\\/\\/test\\.com\\/block",    // url 匹配正则表达式
      "stage": "req",    // 匹配阶段。req: 网络请求前 res: 数据返回前。 v3.5.0 添加
      "target": "reject-json",    // 阻止网络请求，并返回默认的 json 数据
      "enable": true
    },
    {
      "match": "https:\\/\\/httpbin\\.org",         // enable 可省略。如只添加不启用，则设置 enable: false
      "stage": "res",
      "target": "https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/exam-cheerio.js"
    }
  ],
  "task": {           // 同时添加定时任务（可省略）
    "type": "skip",   // 当任务列表中包含同名任务时，新任务的添加方式。skip: 跳过, addition: 新增, replace: 替换（默认，如省略）
    "list": [         // 任务列表，具体格式参考: https://github.com/elecV2/elecV2P-dei/tree/master/docs/06-task.md 订阅 list 相关部分
      {
        "name": "REWRITE 订阅添加的任务",
        "type": "cron",
        "time": "30 0 0 * * *",
        "job": {
          "type": "runjs",
          "target": "https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/test.js"
        }
      }
    ]
  }
}
```

*反引号"\" 为转义字符，实际保存/读取时会自动转义一次，请不要直接在订阅文件中进行复制，然后粘贴到 webUI 中。*

### 其他说明

- *REWRITE 列表的优先级高于 RULES 规则列表。*
- *规则订阅对其他软件的订阅格式有一定的兼容性，但并不保证完全适配。*
- *首次命中 https 请求时，系统会自动签发一张中间证书，可能需要稍长一点时间。*
- *推荐文章: [elecV2P 进阶使用之抓包及 COOKIE 获取](https://elecv2.github.io/#elecV2P%20%E8%BF%9B%E9%98%B6%E4%BD%BF%E7%94%A8%E4%B9%8B%E6%8A%93%E5%8C%85%E5%8F%8A%20COOKIE%20%E8%8E%B7%E5%8F%96)*