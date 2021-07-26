### websocket 通信协议设计

基础: json-RPC
参考: telegram api

### 内部函数管理/初始化

函数和数据分离

服务器端
- 处理客户端发送过来的数据，对应 method
- 更新 method
- 添加 临时 method / 传输函数

``` JS
const wsSer = {
  methods: {    // 现有方法集
    add(){      // 添加新的方法

    }
  }
}
```

### 基础数据传输结构:

客户端发送: client.send
- 发送者 sender
- 发送模块（单元） unit
- 数据类型（调用函数）
- 函数参数
- 需要返回 ？

服务器接收: server.recv
- methods
- reply_to all/sender/unit

服务器发送: server.send
- 指定接收者 （sender/unit）
- 数据类型（调用函数）
- 函数参数
- 需要返回 ？

客户端接收: client.recv
- 接收函数 methods
- reply ?


``` 接收
{
  methods: 'newmthod',
  param
}
```

## 需要实现的功能

- 生成 send 函数。用于向前端网页的某一个单元发送消息
- 生成 recv 函数。用于接收消息并处理

- 