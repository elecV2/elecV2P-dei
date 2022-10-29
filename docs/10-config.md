```
最近更新: 2022-10-28
适用版本: 3.7.4
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/10-config.md
```

## 配置文件说明

elecV2P 配置文件默认保存目录为 **./script/Lists/config.json**。

**请尽量在 webUI->SETTING/设置相关 界面进行修改，而不是手动编辑。**

## 内容

*实际配置文件为严格的 JSON 格式，不包含任何注释。以下注释仅为说明，非注释版本查看 [config.json 示例文件]()*

``` JSON
{
  "anyproxy": {                // anyproxy 相关设置。用于 MITM
    "enable": false,           // 是否启用。默认 false 关闭
    "port": 8001,              // anyproxy 代理端口
    "webPort": 8002            // anyproxy 网络请求查看端口
  },
  "CONFIG_FEED": {             // 通知相关设置
  },
  "CONFIG_RUNJS": {            // 脚本运行相关设置
  },
  "CONFIG_Axios": {            // 网络请求相关设置
  },
  "cors": {
    "enable": false,           // 是否在 response.headers 中设置 Access-Control-Allow-Origin
    "origin": "*"              // Access-Control-Allow-Origin 对应值
  },
  "eapp": {                    // EAPP 相关设置
  },
  "efss": {                    // EFSS 相关设置
  },
  "env": {                     // 环境变量相关设置
  },
  "gloglevel": "info",         // 后台日志显示等级。可选值 error|notify|info|debug，默认 info
  "glogslicebegin": 5,         // 日志时间显示格式。0: 默认，5: 不显示年份，11: 不显示年月日
  "homepage": "http://127.0.0.1",      // 主页地址。用于 RSS 订阅及脚本中的 __home 参数
  "init": {
    "checkupdate": false,      // elecV2P 启动时，是否检测更新。默认 true
    "runjs": ""                // elecV2P 启动时，自动运行脚本。多个脚本使用逗号(,)隔开，比如 test.js, 0body.js
  },
  "lang": "zh-CN",             // 语言偏好。zh-CN 中文|en 英文（多语言翻译龟速进行中... 
  "minishell": true,           // 是否开启 minishell。默认 false 关闭
  "SECURITY": {                // 安全相关设置
    "enable": false,           // 默认不开启（建议在首次打开 webUI 后手动启用
    "blacklist": [             // 禁止访问的 IP 列表。* 表示禁止所有访问（除了下面的 whitelist
      "*"
    ],
    "whitelist": [             // 允许访问的 IP 列表。优先级高于 blacklist
      "127.0.0.1",
      "::1"
    ],
    "cookie": {                // 是否允许通过 cookie 访问。仅当 enable 对应值为 false 时表示不允许
      "enable": true
    },
    "numtofeed": 1,            // 有几次非法访问时出一个默认通知。0: 表示不通知
    "webhook_only": false      // 仅允许 webhook 接口访问
  },
  "update_check": false,       // 是否检测更新
  "update_check_gap": 0,       // 检测更新最低时间间隔。单位 ms。默认 1000*60*30（30 分钟
  "wbrtoken": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",         // webhook token，uuid 格式（建议）。当省略时自动生成。在启动时可通过 env.TOKEN 赋值
  "webhook": {
    "script": {                // 当 webhook type 类型无匹配时的最终处理脚本
      "enable": false,         // 更多说明参考 https://github.com/elecV2/elecV2P-dei/blob/master/docs/09-webhook.md
      "target": "webhook.js"
    },
    "token": "xxxxxxxx-xxx"    // 当前 wbrtoken 缺省时，会使用该值代替(v3.7.4 添加
  },
  "webUI": {                   // webUI 主界面相关设置
    "port": 80,                // webUI 运行端口
    "tls": {
      "enable": false,         // 是否开启 TLS 访问。默认 false 不启用。启用时，建议端口使用 443
      "host": "e.dev"          // 自签 TLS 证书域名
    },
    "logo": {
      "enable": true,          // 是否使用自定义 LOGO
      "src": "//x.xx/x.png",   // LOGO 替换。当该 LOGO 加载失败时，将生成默认 LOGO 头像
      "name": "elecV2"         // LOGO 旁边显示的文字
    },
    "nav": {                   // webUI 导航相关设置
      "overview": {
        "show": true,          // 是否显示该导航条目
        "name": "基础信息"     // 具体显示的导航文字
      },
      "task": {
        "show": true,
        "name": "定时任务"
      },
      "mitm": {
        "show": false
      },
      "rules": {
        "show": false
      },
      "rewrite": {
        "show": true,
        "name": "重写请求"
      },
      "jsmanage": {
        "show": true,
        "name": "脚本管理"
      },
      "setting": {
        "show": true,          // SETTING/设置 导航项默认不能关闭
        "name": "设置相关"
      },
      "cfilter": {
        "show": false,
        "name": ""
      },
      "about": {
        "show": false,
        "name": "简介说明"
      },
      "donation": {
        "show": true,
        "name": "赞助打赏"
      }
    },
    "theme": {                 // webUI 自定义主题（测试功能，部分用户可用
      "simple": {              // 当前应用主题
        "enable": false,       // 是否启用
        "name": "椰树背景",    // 主题名称
        "mainbk": "#2E3784",   // 主要背景色彩
        "maincl": "#6E77FB",   // 主要文字色彩
        "appbk": "url(https://images.unsplash.com/photo-1649256651398-46408de2f095?auto=format&fit=crop&w=1964)",    // 背景
        "style": ".eapp_item .eapp_name {color: var(--main-fc);}"       // 其他附加样式
      },
      "list": [{               // 保存的主题列表。对应值为上面 simple 中除 enable 外的其他值
      }]
    }
  },
  // 规则/脚本/常量等个人数据保存目录（v3.7.4 增加）
  // 对应值应为某个文件夹。当不存在时，将自动生成
  // 支持相对路径和绝对路径 path.resolve(__dirname, path_lists || 'script/Lists')
  "path_lists": "myLists",     // 规则、定时任务等保存文件夹
  "path_script": "/elecv2p/script",        // 脚本文件保存路径
  "path_store": "E:\\elecV2P\\Store",      // store/cookie 常量保存目录
  "path_shell": "./efss/myShell",          // shell 指令默认执行目录

  // 以下为 elecV2P 启动后自动生成的值，预先设置无效（v3.7.4 之后被全部移除
  "path": "/xx/config.json",   // 当前配置文件保存路径。path.join('./script/Lists/config.json')
  "start": 1666488300114,      // 当前 elecV2P 启动时间。Date.now()
  "userid": "md5hash",         // 用户 ID。对应值为 md5(webhook token)
  "version": "3.7.3",          // 当前版本。require('./package.json').version
  "vernum": 373,               // 当前版本的数字表达。Number(version.replace(/\D/g, ''))
  "newversion": "3.7.4",       // 检测到的新版本（如果存在的话
}
```

## 其他说明

配置文件可在启动时通过环境变量(env) **CONFIG** 来指定更改，最终路径为 path.resolve('script/Lists', process.env.CONFIG || 'config.json')。比如 **set CONFIG=123.json&&node index.js**, 则最终配置文件为 **xxx/script/Lists/123.json**。支持绝对路径，比如 **CONFIG=/elecV2P/config.json node index.js**，则最终配置文件为 **/elecV2P/config.json**。

### 说明文档列表

- [overview - 简介及安装](01-overview.md)
- [task - 定时任务](06-task.md)
- [rewrite - 重写网络请求](05-rewrite.md)
- [rules - 网络请求更改规则](03-rules.md)
- [script - 脚本编写及说明](04-JS.md)
- [Docker - Docker 运行相关](02-Docker.md)
- [feed&notify - 通知相关](07-feed&notify.md)
- [logger&efss - 日志和 EFSS 文件管理](08-logger&efss.md)
- [webhook - webhook 使用简介](09-webhook.md)
- [config - 配置文件说明](10-config.md)
- [Advanced - 高级使用篇](Advanced.md)
