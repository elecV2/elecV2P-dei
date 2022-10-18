### 目的

限制某个 token 可访问的目录/时间/次数等。

### 实现

- 可设置多个 token

每个 token 对应的权限:（返回 info
- 完整权限（管理员
- 可访问路径。比如 限制某个 token 除 logs 外其他接口都不可访问
- 可访问时间。2021-07-20 至 2021-07-21 可精确到秒
- 可访问次数。访问几次后，该 token 自动失效
- 其他可能添加
  - 限制 IP

### 问题

相同 token 授于不同权限的？

1. 并集。提供对应 token 的所有权限
2. 禁止/覆盖。仅后条 token 对应权限生效（理论上不可设置相同 token

根据逻辑及方便性取第 **2** 种。但会产生问题，假如想限制某个 token 在某个时间段对某个路径的访问次数，第 2 种授权访问明显无法达到效果。所以还是得采用第 1 种吗？
再仔细想想，此时，可更改 token 授权内容，单个 token 可对应多个权限限制。这里会产生的问题: 如何在前端比较好的表现，让单个 token 可以无限的添加权限？

单 token 单权限可以直接使用一个表格 tr 行进行设置。那单个 token 多个权限呢？ 在保持 token 单元格不动的情况下，增删授权行？

睡了一觉，想法有些改变。应该先设置好相关权限，然后生成相应的 token。甚至更进步一些，设置 token 和权限的对等函数，从 token 中可直接读取到对应权限。这样，在前端方面，可专门设置一个区域用于设置权限，然后生成 token，token 还是以表格的形式进行保存。

于是又产生了一个问题：token 生成函数如何编写/设置呢？得去学习参考 oAuth2.0 相关资料了。

2021-09-18

oAuth2.0 不可取，太 heavy 了。要设计另外的 token 模式，基本形式基于 uuid(比如: fcef12cf-6694-48bb-8568-63bd025cf5ad), 然后按位设计权限，部分使用 主 token 进行加密认证。比如 0x01 表示拥有访问路径的权限，0x02 表示限制访问时间，同时权限则为 0x03，依此类推。然后取 01/02/03 或加密后的两位于 uuid 固定位置中。

关于 uuid 的权限加密及具体协议待进一步仔细设计。

## Cookie 授权登录 2021-10-23 18:18

新增 cookie 授权验证。cookie 生成及验证方式:

``` JS
// 生成
btoa((wbtoken + wbtoken ).substr(iRandom(wbtoken.length), 8))

// 验证
let cookies = cookie.parse(req.headers.cookie || '')
(wbtoken + wbtoken).indexOf(atob(cookies.token)) !== -1
```

优点:

- 和 token 相关联(部分)，切换 token 后 cookie 失效
- 计算简单，可快速检测 cookie 是否有效

缺点:

- 不够优雅？
- 如果原来的 token 太简单的话，可能会被碰撞出结果

## 临时多 TOKEN 设计

``` JSON
"tokens": {
  "md5hash(token)": {
    "token": "9855d6cb-0c70-41d2-a246-54ebb365e9e3",
    "path": "/efss/temp*|/logs",        // 可访问路径。正则表达式字符串，匹配方式 new RegExp(path).test(req.path)
    "note": "给 XX 的临时 TOKEN",       // 备注信息
  }
}
```