### 基础格式

参考苹果、安卓应用中心的分类模式。

``` JSON
{
  "category": "类别",
  "scripts": [
    {
      "name": "name.js",
      "logo": "url/to/logo_180x180.png",
      "note": "一些备注，关于脚本的说明",
      "tags": ["elecV2P", "标签"],
      "author": "elecV2",
      "homepage": "url/to/author",
      "resource": "url/to/file.js",
      "thumbnail": ["url/to/thum1.jpg", "url/to/thum2.jpg"],
      "sponsor_img": "url/to/qr.png",
      "sponsor_txt": "捐赠支持说明/或其他账号",
      "content_hash": "auto content md5 hash",
      "date_created": "2022-03-08 20:35",
      "date_updated": "2022-03-08 20:36",
    }
  ],
  "resources": [
    "https://wogowoodk.json"
  ]
}
```

``` JSON main.json
// 主入口文件
{
  "category": [
    {
      "name": "分类名称",
      "note": "分类描述",
      "resources": [
        "url1/to/scripts.json",
        "url2/to/scripts.json"
      ]
    }, {
      "name": "另一分类",
      "note": "分类描述",
      "resources": [],
    }
  ]
}
```

### 细节实现

- 主入口 main.json
- 分段获取多 json 文件
- 智能化标签自动生成 json 片断
- 新建 GITHUB 库存放 JSON
- 默认 LOGO（无 logo 时替换
- 用户上传发布(PR
- 个人脚本管理(PR
- 搜索 HASHTREE（自动生成更新
- 快速定位脚本，获取内容
- 增加任务/重写订阅的分类

### 工具

- content hash
- 快速生成 LOGO（基于 hash
- 自动生成上传日期
- 自动检测文件大小
- 自动生成标签列表