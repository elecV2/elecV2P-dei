/**
 * 先使用 https://t.me/BotFather 创建一个机器人 bot
 * 然后把 bot token 填写到下面对应位置。 然后打开一下 bot，接收信息
 * 自己的 chatid 可使用 https://t.me/elecV2Fun_bot ，发送关键字 id 获取
 * 如果要给别人发信息，需要知道对方 chatid，并且对方已开启了你的 bot
 *
 * cron  8 8 8 * * * tgbotmessage.js
 * 
 * 作者：@elecV2
 */


const CONFIG = {
  chatid: '8xxxxx',      // 接受信息的用户 id. 
  token: '8161xxx-xxxxxxxxxxxxxxxx'     // tg bot took
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
    'Content-Type': 'application/json'
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