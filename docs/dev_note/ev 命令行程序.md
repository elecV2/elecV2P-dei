### ev binary 可执行程序

elecV2P 可执行程序

形式，要实现的功能

``` sh
ev -help, -h     # 帮助菜单

# elecV2P 全局控制类
ev start     # 开始 elecV2P
ev stop      # 停止 elecV2P
ev update    # 更新 elecV2P

## 可能
ev install   # 可选择 node 安装 还是 Docker
ev i         # 同上
  # options
  # -o nodejs | docker
  # -e Asia/Shanghai
  # -p 8100/8101/8102

# 状态类
ev status    # 显示状态
ev save      # 保存信息

# 配置类
ev config    # 列出配置
ev config webUI    # 列出某项配置
ev config set minishell 1    # 修改某项配置

# 执行类
ev xxxx.js   # 以 elecV2P 模式运行脚本
ev run xxx.js      # 同上
ev download url    # 下载文件
```

### 具体实现

node cmd binary