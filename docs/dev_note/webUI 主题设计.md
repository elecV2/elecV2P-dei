### 基本格式

``` JSON
{
  "themeone": {
    "name": "主题名称",
    "note": "一些说明",
    "color": {
      "--main-bk": "#003153",
      "--main-fc": "#FBFBFF",
      "--secd-bk": "#A7A8BD88",
      "--secd-fc": "#003153B8",
    },
    "logo": "url",
  }
}
```

### 包含内容

- 颜色（文字/背景等

以下为可选项
- 圆角大小
- 图标 logo
- 标题 title

### 具体实现

:root[theme="themename"] {
  --main-bk: #003153;
  --main-fc: #FBFBFF;
  --secd-bk: #A7A8BD88;
  --secd-fc: #003153B8;
  --note-bk: #EF7A82;
  --antd-wave: #1890FF;
  --blue-bk: #1890FFB8;
  ...
}