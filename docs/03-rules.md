```
最近更新： 2020-6-27
适用版本： 1.9.0
```

## modify 规则集 -- elecV2P 原生格式说明

|   匹配方式   |  内容（正则表达式）   |   modify  |       最终数据      |  
 :-----------: | --------------------- | :-------: | ------------------- | --------
| ip           | 192.168.1.1           | 301/302   | https://google.com  |  前(req)
| url          | ^https://api.b.com/v2 | js        | file.js             |  后(res)
| host         | api.bilibili.com      | useragent | iPhone 6s           |  
| useragent    | neteaseMusic | aliApp | block     | reject|tinyimg
| reqmethod    | GET|POST|PUT|DELETE   |           | 
| reqbody      | queryPara|word string |           |
| resstatus    | 200 | 404 | 301 | ... |           |
| restype      | text/html | text/json | -----     |
| resbody      | Keyword(string)       | all - JS  |


保存后，根据表格内容自动生成 **default.list**

```
[elecV2P rules]
ip,192.168.1.1,301,https://google.com,req
url,^https://api.b.com/v2,js,file.js,res
host,api.bilibili.com,useragent,iPhone 6s,res
useragent,neteaseMusic,block,reject
reqmethod,GET,block,tinyimg
reqbody,key string,js,other.js
resstatus,404,js,404.js,res
restype,text/html,js,file.js
resbody,key string,301,google.com,res
```

## 具体说明

### 匹配方式

```
ip              // 匹配 IP 
url             // 匹配 url 
host            // 匹配 url host 部分
useragent       // 匹配 User-Agent 
reqmethod       // 匹配 网络请求方式
reqbody         // 匹配 请求体（body）
resstatus       // 匹配 请求返回的状态码
restype         // 匹配 返回的数据类型
resbody         // 匹配 返回的数据
```


### 网络请求前可修改内容

- User-Agent 等 header
- block/reject
- body
- response 任意值（提前返回）
- 30x 重定向

### 网络请求后可修改内容

- body
- ...