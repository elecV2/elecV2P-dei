```
最近更新： 2020-7-16
适用版本： 2.1.0
```

## modify 规则集 格式说明

|   匹配方式   |    匹配内容（正则）   |  修改方式 |       修改内容      |  修改时间
 :-----------: | --------------------- | :-------: | ------------------- | ----------
| ip           | 192.168.1.1           | 301/302   | https://google.com  |  前(req)
| url          | ^https://api.b.com/v2 | JS        | file.js             |  后(res)
| host         | api.bilibili.com      | useragent | iPhone 6s           |  
| useragent    | neteaseMusic | aliApp | block     | reject|tinyimg
| reqmethod    | GET|POST|PUT|DELETE   | $HOLD     | 30
| reqbody      | queryPara|word string |           |
| resstatus    | 200 | 404 | 301 | ... |           |
| restype      | text/html | text/json | -----     |
| resbody      | Keyword(string)       | all - JS  |


保存后，根据表格内容自动生成 **default.list**

```
[elecV2P rules]
ip,192.168.1.1,301,https://google.com,req
url,^https://api.b.com/v2,js,file.js,res
url,httpbin.org/get,hold,0,res
useragent,neteaseMusic,block,reject
reqmethod,GET,block,tinyimg
reqbody,key string,js,other.js
resstatus,404,js,404.js,res
restype,text/html,js,file.js
resbody,key string,301,google.com,res
```

## 匹配方式

```
ip              // 匹配 IP 
url             // 匹配 url 
host            // 匹配 url host 部分
useragent       // 匹配 User-Agent 
reqmethod       // 匹配 网络请求方式
reqbody         // 匹配 请求体（body）
resstatus       // 匹配 请求返回的状态码
restype         // 匹配 返回的数据类型
resbody         // 匹配 返回的数据内容
```

## 修改方式

### JS

通过 JS 脚本修改网络请求数据，对应修改内容为 JS 文件名

### 301 重定向

对应修改内容为重定向目标网址

如需使用使用 30x 状态码，请手动在 **runjs/Lists/default.list** 中更改

### 阻止

reject: 返回状态码 200, body 为空。 
tinyimg: 返回状态码为 200, body 为一张 1x1 的图片

### $HOLD

将原网络请求的 header 和 body 发送到前端网页进行修改处理，然后将修改后的数据直接发送给服务器/客户端。

对应修改内容表示等待前端修改数据的时间，单位秒。当为 **0** 时，表示一直等待。如果为其他值且超时时则直接使用原数据进行下步操作。

使用该修改方式时，请尽量使用比较详细的匹配规则，匹配单一网络请求，否则后面的 $HOLD 请求会覆盖前面的数据。

**2020.7.16 2.1.0 更新**

$HOLD request reject - 直接返回当前数据

返回默认状态码： 200

数据包含两部分： header 和 body


### User-Agent

修改请求 header 中的 User-Agent。

默认 User-Agent 列表位于： **runjs/Lists/useragent.list** ，可自行根据需求进行修改

## 修改时间

### 网络请求前

beforeSendRequest

### 数据返回前

beforeSendResponse
