# web 重构计划（基本完成）

## 左侧导航栏菜单 menu

- OVERVIEW
  - Port web/proxy/查看请求（anyproxy）
  - rules/rewrite/task/mitm list lenght
- RULES
  - elecV2P default.list
- REWRITE
  - Table url file.js
- JSMANAGE
  - JS upload
  - filelist editor
- TASK
  - overview task list/table name,type,time,job,stat/controll
  - new task form table
- MITM
  - rootCA
  - mitm host

- CFILTER
- SETTING
- ABOUT
- DONATION

## 未来计划

- [x] 去 ant design vue
- [x] 移动端优化

### 右键菜单 contextmenu.vue

``` XML
<contextmenu :menus='menu.list' :x='menu.x' :y='menu.y' />
```

- x <number> : x 坐标
- y <number> : y 坐标
- menus <array> : 菜单内容
  - 菜单选项 <object> (建议始终设置 label，其他项视情况添加)
    - label <string> : 菜单显示文字
    - click <function> : 点击文字后执行函数
    - rclick <function> : 右键菜单后执行函数
    - dclick <function> : 双击菜单后执行函数
    - color <string> : 菜单选项颜色
    - bkcolor <string> : 菜单选项背景颜色
    - fontsize <string> : 菜单选项文字大小
  - 菜单选项 <object> 同上
  - ...