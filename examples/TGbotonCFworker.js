/**
 * 说明：可部署到 cloudfalre worker 的 TGbot 后台代码，用于通过 telegram 查看/控制 elecV2P
 *
 * 使用方式：
 * 先申请好 TG BOT(https://t.me/botfather)，然后设置好 CONFIG 内容
 * tgbot token: 在 telegram botfather 中找到 api token, 然后填写到相应位置
 * 然后把修改后的整个 JS 内容粘贴到 cloudfalre worker 代码框，保存即可。得到一个类似 https://xx.xxxxx.workders.dev 的网址
 * 接着使用 https://api.telegram.org/bot(你的 tgbot token)/setWebhook?url=https://xx.xxxxx.workders.dev 给 tg bot 添加 webhook，部署完成。
 * 最后，打开 tgbot 对话框，输入下面的相关指令，测试 TGbot 是否成功。
 *
 * 实现功能及相关指令：
 * 查看服务器资源使用状态
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
 * /taskdel taskid      ;删除任务
 * /tasksave            ;保存当前任务列表
 * 
 * 脚本相关
 * /listjs              ;列出所有 JS 脚本。
 * /runjs file.js       ;运行脚本
 * /runjs https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/webhook.js
 * /deljs file.js       ;删除脚本
**/

const CONFIG_EV2P = {
  url: "https://xxxxx.xxxxxx.com/",          // elecV2P 服务器地址
  wbrtoken: 'xxxxxx-xxxxxxxxxxxx-xxxx',      // elecV2P 服务器 webhook token
  token: "xxxxxxxx:xxxxxxxxxxxxxxxxxxx",     // teleram bot token
  slice: -800,           // 截取日志最后 800 个字符，以防太长无法传输
  userid: null           // 只对该 userid 发出的指令进行回应。null：回应所有用户的指令
}

function getLogs(s){
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=getlog&fn=' + s).then(res=>res.text()).then(r=>{
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
  if (!/start|stop|del|delete/.test(op)) {
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

function saveTask() {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=tasksave').then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  })
}

function jsRun(fn) {
  if (!fn.startsWith('http') && !/\.js$/.test(fn)) fn += '.js'
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=runjs&fn=' + fn).then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  })
}

function getJsLists() {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'jsmanage?token=' + CONFIG_EV2P.wbrtoken).then(res=>res.json()).then(r=>{
      resolve(r.jslists.join('    ') + '\ntotal: ' + r.jslists.length)
    }).catch(e=>{
      reject(e)
    })
  })
}

function deleteJS(name) {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'jsfile?token=' + CONFIG_EV2P.wbrtoken, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsfn: name
      })
    }).then(res=>res.text()).then(r=>{
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
        if (CONFIG_EV2P.userid && body.message.chat.id !== CONFIG_EV2P.userid ) {
          payload.text = "check the project: https://github.com/elecV2/elecV2P"
        } else if (/^\/?status/.test(bodytext)) {
          payload.text = await getStatus()
        } else if (/^\/?(del|delete) /.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          if (!(cont === 'all' || /\.log$/.test(cont))) cont = cont + '.js.log'
          payload.text = await delLogs(cont)
        } else if (/^\/?taskinfo /.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await getTaskinfo(cont)
        } else if (/\.log$/.test(bodytext) || /^\/?log /.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          if (!/\.log$/.test(cont)) cont = cont + '.js.log'
          payload.text = await getLogs(cont)
        } else if (/^\/?taskstart /.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await opTask(cont, 'start')
        } else if (/^\/?taskstop /.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await opTask(cont, 'stop')
        } else if (/^\/?taskdel /.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await opTask(cont, 'del')
        } else if (/^\/?tasksave/.test(bodytext)) {
          payload.text = await saveTask()
        } else if (/^\/?listjs/.test(bodytext)) {
          payload.text = await getJsLists()
        } else if (/^\/?deljs /.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await deleteJS(cont)
        } else if (/^\/?runjs /.test(bodytext)) {
          let cont = bodytext.split(' ').pop()
          payload.text = await jsRun(cont)
        } else if (/^\/?all/.test(bodytext)) {
          bodytext = 'all'
          let res = await getLogs(bodytext)
          let map = JSON.parse(res)
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
              text: s.replace(/\.js\.log$/g, '')
            }) 
            : keyb.keyboard[row] = [{
              text: s.replace(/\.js\.log$/g, '')
            }]
          })
          payload.text = "点击查看日志"
          payload.reply_markup = keyb
        } else if (!/\.log$/.test(bodytext)) {
          bodytext = bodytext + '.js.log'
          payload.text = await getLogs(bodytext)
          payload.text = payload.text.slice(CONFIG_EV2P.slice)
        } else {
          payload.text = '暂不支持的指令\ncheck the project: https://github.com/elecV2/elecV2P'
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