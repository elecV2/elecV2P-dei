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
    "bkimage": "background-image url",
  }
}
```

### 包含内容

- 颜色（文字/背景等

以下为可选项（可能
- 圆角大小
- 图标 logo
- 标题 title

### 具体实现

```
.theme--name {
  --main-bk: #003153;
  --main-fc: #FBFBFF;
  --main-cl: #1890FF;
  --sect-bk: #F0F2F5;
  --secd-bk: #A7A8BD88;
  --secd-fc: #003153B8;
  ...
}

document.body.className = 'theme--name'
```

### 透明模式

``` CSS
#app {
  background-image: url(https://images.unsplash.com/photo-1646505183416-f3301d2a8127);
  --main-bk: #2e811c;
}

.section > .sider, .section, .content, .header, .footer {
  background: transparent;
}
```

config.json

``` JSON
transparent: {
  "mainbk": "#123456",
  "enable": true,
  "bkimage": "https://xxx",
}
```