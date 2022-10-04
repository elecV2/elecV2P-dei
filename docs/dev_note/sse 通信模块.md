### server-sent events

需求分析：

- send message(or no)

问题：

- 多用户（同一个请求路径
- 多连接（单用户多个请求路径
- 多请求（单连接发送多次数据
- 多函数（不同数据对应不同处理函数
- 多参数（不同处理函数包含不同参数

如何区分？

作以下限制：

单页面只能有一个连接（不同页面的同一路径请求如何区分？
页面刷新后如何复用的问题

### 要实现的功能

- 服务器端

``` JS
/** clients 数据结构
{
  target1: {
    euid: res, euid: res, euid: res
  },
  target2: {euid: res},
}
可使用 query 指定 euid，方便重复使用（断开后重连
优势：
- 自定义多路径
- 同一路径多个请求
***/
class sse {
  constructor({ app }) {
    this.clients = new Map();
    if (app) {
      app.get('/sse/:target', (req, res)=>{
        // 同一 target 只能对应一个 clients
        // main/message 多个对应(取消)
        if (this.clients.has(req.params)) {
          clog.info('end old sse connection', req.params);
          this.clients.get(req.params).end();
        }
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        });
        clog.info('new sse connection on', req.params);
        this.clients.set(req.params, res);
        req.on('close', ()=>{
          // this.clients.get(req.params).end();
          this.clients.delete(req.params);
        })
      })
    } else {
      clog.error('express app is expect');
    }
  }

  sent(target, message) {
    if (this.clients.has(target)) {
      let res = this.clients.get(target);
      if (message === 'end') {
        res.end();
        return;
      }
      res.write(JSON.stringify(message));
      return;
    }
    clog.error('sse connection', target, 'not ready yet');
  }
}

sse.send(target, message);
// sse.send('main', {})
```

- 客户端

``` JS
sse.recv(target, message=>{
  handle(message);
  done();
})
```

### 其他实现

假如分两种连接类型：

- 单路径单连接 /sse/efss
- 单路径多连接 /sse