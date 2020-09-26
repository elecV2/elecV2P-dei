/**
 * 先设置好 CONFIG 内容
 * tgbot token: 先申请 telegram bot api token, 然后填写到相应位置
 * 使用 https://api.telegram.org/bot(mytoken)/setWebhook?url=https://mywebpagetorespondtobot 给 tg bot 添加 webhook 才可生效
 *
 * TGbot 相关指令
 * 服务器资源使用状态
 * status === /status  ;任何包含 status 关键字的指令
 * 
 * 删除 log 文件
 * /delete file === /delete file.js.log === /del file
 * /delete all  ;删除使用 log 文件
 *
 * 查看 log 文件
 * /log file === file === file.js.log
 * all    ;返回所有 log 文件列表
 *
 * 任务相关
 * /taskinfo taskid     ;获取任务信息
 * /taskinfo all        ;获取所有任务信息
 * /taskstart taskid    ;开始任务
 * /taskstop taskid     ;停止任务
 *
 * 运行脚本
 * /runjs file.js
 * /runjs https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/webhook.js
 */

const CONFIG_EV2P = {
  url: "https://xxxxx.xxxxxx.com/",      // web 地址
  wbrtoken: 'xxxxxx-xxxxxxxxxxxx-xxxx',  // webhook token
  token: "xxxxxxxx:xxxxxxxxxxxxxxxxxxx",      // teleram bot token
  slice: -800           // 截取日志最后 800 个字符，以防太长无法传输
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

function delLogs(logn) {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=deletelog&fn=' + logn).then(res=>res.text()).then(r=>{
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

function getTaskinfo(tid) {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=taskinfo&tid=' + tid).then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  })
}

function opTask(tid, op) {
  if (!/start|stop/.test(op)) {
    return 'unknow operation' + op
  }
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=task' + op + '&tid=' + tid).then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  })
}

function jsRun(fn) {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=runjs&fn=' + fn).then(res=>res.text()).then(r=>{
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
        "parse_mode": "html",
        "disable_web_page_preview": true,
      };
      if (body.message.text) {
        let bodytext = body.message.text
        if (/status/.test(bodytext)) {
          payload.text = await getStatus()
        } else if (/^\/(del|delete)/.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          if (!(cont === 'all' || /\.log$/.test(cont))) cont = cont + '.js.log'
          payload.text = await delLogs(cont)
        } else if (/^\/taskinfo/.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await getTaskinfo(cont)
        } else if (/\.log$/.test(bodytext) || /^\/log/.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          if (!/\.log$/.test(cont)) cont = cont + '.js.log'
          payload.text = await getLogs(cont)
        } else if (/^\/taskstart/.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await opTask(cont, 'start')
        } else if (/^\/taskstop/.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await opTask(cont, 'stop')
        } else if (/^\/runjs/.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await jsRun(cont)
        } else if (/^all/.test(bodytext)) {
          bodytext = 'all'
          payload.text = await getLogs(bodytext)
          let map = [ ...payload.text.matchAll(/>([A-z0-9\.]+)<\/a>/g) ]
          let keyb = { 
                keyboard:[
                  [
                    { text: 'all - ' + map.length },
                    { text: 'status' }
                  ]
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
        } else {
          payload.text = '暂不支持的指令'
        }

        const myInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
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
  const { url } = request
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