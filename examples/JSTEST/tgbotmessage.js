/**
 * 功能：使用TG bot 给频道或他人发信息
 * 使用方法：
 * 先使用 https://t.me/BotFather 创建一个机器人，获取 bot token
 * 然后获取目标用户的 chatid，填写到下面对应位置。 然后start bot
 *
 * 如果要发送到频道，先将机器人拉到频道并给予管理员权限
 *
 * cron  8 8 8 * * * https://raw.githubusercontent.com/elecV2/elecV2P-dei/master/examples/JSTEST/tgbotmessage.js
 */


const CONFIG = {
  chatid: '8xxxxxxxxxx',      // 接受信息的用户 id
  token: '8161xxx-xxxxxx'     // tg bot took
}

// message 可根据自己的需求进行修改，支持 markdown 语法
let message = `[必应随机壁纸](https://bing.ioliu.cn/v1/rand?${Date.now()})`   // api 来源： https://github.com/xCss/bing


const payload = {
  "method": "sendMessage",
  "chat_id": CONFIG.chatid,
  "parse_mode": "markdown",
  "disable_web_page_preview": false,
  "text": 'hello world!'
}

payload.text = message

const myRequest = {
  url: `https://api.telegram.org/bot${CONFIG.token}/`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  body: JSON.stringify(payload)
}

$task.fetch(myRequest).then(res => {
  try {
    let body = JSON.parse(res.body)
    if (body.ok) {
      let result = body.result
      console.log('send', result.chat.username, result.chat.first_name, result.chat.last_name, 'message:', result.text)
    } else {
      console.log(body)
    }
  } catch {
    console.log(res.body)
  }
}, error => {
  console.log(error)
})