### 基础格式

参考苹果、安卓应用中心的分类模式。

``` JSON
{
	"category": "类别",
	"scripts": [
		{
			"name": "aof.js",
			"logo": "url/to/logo.png",
			"note": "一些备注",
			"tags": ["ele", "标签"],
			"author": "elecV2",
			"author_page": "url/to/author",
			"resource": "url/to/file.js",
			"sponsor_img": "url/to/qr.png",
			"sponsor_url": "url/to/donation",
			"content_hash": "auto content md5 hash",
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
- 分段获取 多 json 文件
- 智能化 标签自动生成 json 片断
- 新建 GITHUB 库存放 JSON
- 默认 LOGO（无 logo 时替换
- 用户上传发布(PR
- 个人脚本管理(PR
- 搜索 HASHTREE（自动生成更新
- 快速定位脚本，获取内容
- 增加任务/重写订阅的分类

### 工具

- 快速生成 LOGO
- content hash