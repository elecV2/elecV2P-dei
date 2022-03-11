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
  --secd-bk: #A7A8BD88;
  --secd-fc: #003153B8;
  ...
}

document.body.className = 'theme--name'
```

### 简单主题

``` JS
// TEST 简单测试代码
document.head.insertAdjacentHTML('beforeend', `<style>
#app {
  --main-bk: #326733;
  background: url(https://images.unsplash.com/photo-1646505183416-f3301d2a8127);
}

.section > .sider,
.sider_trigger.sider_trigger--mobile,
.section, .content, .header, .footer {
  background: transparent;
}
</style>`)
// background: #222E
// background: #0008
app.style.setProperty('--main-bk', '#222E')
```

config.json

``` JSON
"theme": {
  "simple": {
    "enable": true,
    "mainbk": "#123456",
    "appbk": "https://xxx",
    "elebk": "transparent",
  },
  "lists": []
}
```