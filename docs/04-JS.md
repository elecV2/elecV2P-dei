## 运行模式 - [vm](https://nodejs.org/api/vm.html)

``` JS
const newScript = new vm.Script("var body='this is a js code'")
newScript.runInNewContext(context)n
```

## context - JS 运行环境

### 网络请求

``` JS
$axios(req, cb)
```

req:  [axios](https://github.com/axios/axios) request
cb:   callback 函数，(res)=>{ }
请求成功 res: axios response，请求失败返回 res: { error }

### 常量/cookie 存储

``` JS
$store.put(value, key)
$store.get(key)
```