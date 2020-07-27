/**
 * 先设置好 CONFIG 内容
 * tgbot token: 先申请 telegram bot api token, 然后填写到相应位置
 * 使用 https://api.telegram.org/bot(mytoken)/setWebhook?url=https://mywebpagetorespondtobot 给 tg bot 添加 webhook 才可生效
 */

const CONFIG_EV2P = {
  url: "https://xlxxxxg.xxxxxx.com/",      // web 地址
  wbrtoken: 'a8c259b2-xxxxxxxxxxxx-xxxx',  // webhook token
  token: "81xxxxxx:xxxxxxxzcxPxxxxxxxxxx",      // teleram bot token
  slice: -1200           // 截取日志最后 1200 个字符，以防太长无法传输
}

function getLogs(s){
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'logs/' + s).then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  })
}

function getStatus() {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?type=status&token=' + CONFIG_EV2P.wbrtoken).then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  })
}

async function handlePostRequest(request) {
  let bodyString = await readRequestBody(request)

  try {
    let body = JSON.parse(bodyString);

    if (body.message) {
      let payload = {
        "method": "sendMessage",
        "chat_id": body.message.chat.id,
        "parse_mode": "markdown",
        "disable_web_page_preview": true,
      };
      if (body.message.text) {
        let bodytext = body.message.text
        if (bodytext === 'myid') {
          payload.text = body.message.chat.id
        } else if (bodytext === 'status') {
          payload.text = await getStatus()
        } else if (/^all/.test(bodytext)) {
          bodytext = 'all'
          payload.text = await getLogs(bodytext)
          let map = [ ...payload.text.matchAll(/>([A-z0-9\.]+)<\/a>/g) ]
          let keyb = { 
                keyboard:[
                  [{ text: 'all - ' + map.length }]
                ],
                resize_keyboard: false,
                one_time_keyboard: true,
                selective: true
              }

          map.forEach((s, ind)=> {
            let row = parseInt(ind/2) + 1
            keyb.keyboard[row]
            ? keyb.keyboard[row].push({
              text: s[1].replace(/\.js\.log$/g, '')
            }) 
            : keyb.keyboard[row] = [{
              text: s[1].replace(/\.js\.log$/g, '')
            }]
          })
          payload.text = "点击查看日志"
          payload.reply_markup = keyb
        } else if (!/\.log$/.test(bodytext)) {
          bodytext = bodytext + '.js.log'
          payload.text = await getLogs(bodytext)
          payload.text = payload.text.slice(CONFIG_EV2P.slice)
        } else if ('errors.log' === bodytext) {
          payload.text = `[errors.log](${CONFIG_EV2P.url}logs/errors.log)`
        } else {
          payload.text = '暂不支持的指令'
        }

        const myInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        };

        let myRequest = new Request(`https://api.telegram.org/bot${CONFIG_EV2P.token}/`, myInit)

        fetch(myRequest).then(function(x) {
          console.log(x);
        });
        return new Response("OK")
      } else {
        return new Response("OK")
      }
    } else {
      return new Response(JSON.stringify(body), {
        headers: { 'content-type': 'application/json' },
      })
    }
  } catch(e) {
    return new Response(e)
  }
}

async function handleRequest(request) {
  let retBody = `The request was a GET `
  return new Response(retBody)
}

addEventListener('fetch', event => {
  const { request } = event
  if (request.method === 'POST') {
    return event.respondWith(handlePostRequest(request))
  } else if (request.method === 'GET') {
    return event.respondWith(handleRequest(request))
  }
})

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
  const { headers } = request
  const contentType = headers.get('content-type')
  if (contentType.includes('application/json')) {
    const body = await request.json()
    return JSON.stringify(body)
  } else if (contentType.includes('application/text')) {
    const body = await request.text()
    return body
  } else if (contentType.includes('text/html')) {
    const body = await request.text()
    return body
  } else if (contentType.includes('form')) {
    const formData = await request.formData()
    let body = {}
    for (let entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return JSON.stringify(body)
  } else {
    let myBlob = await request.blob()
    var objectURL = URL.createObjectURL(myBlob)
    return objectURL
  }
}