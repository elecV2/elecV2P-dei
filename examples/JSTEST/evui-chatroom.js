// 两个设备分别运行此脚本，可实现一个简单的聊天室。
// 关于 $evui 的更多说明参考 https://github.com/elecV2/elecV2P-dei/tree/master/docs/04-JS.md 相关部分

let id = 'aa3a9f9fcc'      // 给聊天室设置一个 ID
$evui({
  id,
  title: 'elecV2P $evui test',
  width: 800,
  height: 400,
  content: "<p>a simple chatroom</p>",
  style: "background: #FF8033; font-size: 32px; text-align: center",
  resizable: true,
  cbable: true,
  cbdata: 'hello',
  cblabel: '发送'
}, data=>{
  console.log('get new data', data)
  // 通过 ID 使用 websocket 发送数据到指定客户端
  $ws.send({ type: 'evui', data: { id, data: data + '\n' }})
}).then(data=>console.log(data))

console.log(id, 'chatroom is ready')