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

*最后实现使用其他的实现方式*

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

### 自定义主题

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
// #app {--main-bk: #2E3784;--main-fc: #FFCB40;--main-cl: #64AAD0;}
// #app {--main-bk: #2e1630;--main-fc: #e9bb4c;--main-cl: #d3fd3c;}

// background: #222E
// background: #0008
app.style.setProperty('--main-bk', '#222E')
```

前端设置 UI:

NAEM 主色彩 导出 启用 删除

### 最终实现方案

``` JSON
"theme": {
  "simple": {
    "enable": true,
    "mainbk": "#123456",
    "appbk": "https://xxx",
    "elebk": "transparent",
    "style": "#app{}",
  },
  "list": [{
    "name": "主题名称",
    "mainbk": "#123456",
    "appbk": "https://xxx",
    "elebk": "transparent",
    "style": "#app{}",
  }, {
    "name": "主题名称",
    "mainbk": "#2E3784",
    "appbk": "https://xxx",
    "elebk": "transparent",
    "style": "#app{}",
  }]
}
```

### Todo

- [x] 主题保存切换
- [x] 主题导入导出
- [x] 自定义 style