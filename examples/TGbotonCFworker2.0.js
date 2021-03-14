/**
 * 功能：部署在 cloudfalre worker 的 TGbot 后台代码，用于通过 telegram 查看/控制 elecV2P
 * 地址：https://github.com/elecV2/elecV2P-dei/blob/master/examples/TGbotonCFworker2.0.js
 * 
 * 使用方式：
 * 先申请好 TG BOT(https://t.me/botfather)，然后设置好下面代码中 CONFIG_EV2P 的内容
 * tgbot token: 在 telegram botfather 中找到 api token, 然后填写到相应位置
 * 然后把修改后的整个 JS 内容粘贴到 cloudfalre worker 代码框，保存即可。得到一个类似 https://xx.xxxxx.workders.dev 的网址
 * (2.0 版本需要使用 CF 的 kv 功能，先在 CF 中创建一个 kv 库，然后绑定到当前 worker，命名为 elecV2P)
 * 接着在浏览器中打开链接: https://api.telegram.org/bot(你的 tgbot token)/setWebhook?url=https://xx.xxxxx.workders.dev 给 TGbot 添加 webhook，部署完成
 * 最后，打开 TGbot 对话框，输入下面的相关指令，测试 TGbot 是否成功
 *
 * 2.0 更新：添加上下文执行环境（还在测试优化中）
 * - /runjs   进入脚本执行环境，接下来直接输入文件名或远程链接则可直接运行
 * - /task    进入任务操作环境，可直接点击按钮暂停开始任务。（前面的绿色龟表示任务运行中）
 * - /shell   进行 shell 执行环境，默认 timeout 为 3000ms（v3.2.4 版本后生效）
 * - /context 获取当前执行环境，如果没有，则为普通模式
 * 其它模式完善中...
 * 
 * 特殊指令 sudo clear ; 清空当前 context 值（以防服务器长时间无返回而卡死的问题）
 *
 * 下面 /command 命令的优先级高于当前执行环境
 *
 * 实现功能及相关指令：
 * 查看服务器资源使用状态
 * status === /status  ;任何包含 status 关键字的指令
 * 
 * 删除 log 文件
 * /deletelog file === /deletelog file.js.log === /dellog file
 * /dellog all  ;删除使用 log 文件
 *
 * 查看 log 文件
 * /log file
 * /all === all   ;返回所有 log 文件列表
 *
 * 任务相关
 * /taskinfo all        ;获取所有任务信息
 * /taskinfo taskid     ;获取单个任务信息
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
 *
 * shell 指令相关
 * /exec ls  ===  /shell ls  ===  exec ls
 * exec pm2 ls
 * 
 * bot commands 2.0
runjs - 运行 JS
task - 开始暂停任务
status - 内存使用状态
shell - 执行简单 shell 指令
end - end context
tasksave - 保存任务列表
taskdel - 删除任务
deljs - 删除 JS
dellog - 删除日志
log - 获取日志
context - 查看当前执行模式
**/

const CONFIG_EV2P = {
  name: 'elecV2P',                           // bot 名称。可省略
  url: "https://xxxxx.xxxxxx.com/",          // elecV2P 服务器地址
  wbrtoken: 'xxxxxx-xxxxxxxxxxxx-xxxx',      // elecV2P 服务器 webhook token
  token: "xxxxxxxx:xxxxxxxxxxxxxxxxxxx",     // teleram bot token
  slice: -800,           // 截取日志最后 800 个字符，以防太长无法传输
  userid: [],            // 只对该列表中的 userid 发出的指令进行回应。默认：回应所有用户的指令
  kvname: elecV2P,       // 保存上下文内容的 kv namespace。在 cf 上创建并绑定后自行更改
  shell: {
    timeout: 1000*6,     // shell exec 超时时间，单位: ms
    contexttimeout: 1000*60*5,               // shell 模式自动退出时间
  }
}

const store = {
  put: async (key, value)=>{
    return await CONFIG_EV2P.kvname.put(key, value)
  },
  get: async (key, type)=>{
    return await CONFIG_EV2P.kvname.get(key, type)
  },
  delete: async (key)=>{
    await CONFIG_EV2P.kvname.delete(key)
  },
  list: async ()=>{
    const val = await CONFIG_EV2P.kvname.list()
    return val.keys
  }
}

const context = {
  get: async (uid) => {
    return await store.get(uid, 'json')
  },
  put: async (uid, uenv, command) => {
    let ctx = await context.get(uid)
    if (typeof ctx !== 'object') {
      ctx = {
        command: []
      }
    }
    if (uenv) {
      ctx.context = uenv
    }
    if (command) {
      ctx.command ? ctx.command.push(command) : ctx.command = [command]
    }
    ctx.active = Date.now()
    await store.put(uid, JSON.stringify(ctx))
  },
  run: async (uid, target) => {
    const ctx = await context.get(uid)
  },
  end: async (uid) => {
    await store.put(uid, JSON.stringify({}))
  }
}

function getLogs(s){
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=getlog&fn=' + s).then(res=>res.text()).then(r=>{
      resolve(r.slice(CONFIG_EV2P.slice))
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
      resolve(r.jslists)
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

function shellRun(command) {
  if (command) {
    command = encodeURI(command)
  } else {
    return '请输入 command 指令，比如：ls'
  }
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + `&type=shell&timeout=${CONFIG_EV2P.shell && CONFIG_EV2P.shell.timeout || 3000}&command=` + command).then(res=>res.text()).then(r=>{
      resolve(r.slice(CONFIG_EV2P.slice))
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
      }
      if (body.message.text) {
        let bodytext = body.message.text.trim()
        let uid = 'u' + payload['chat_id']

        if (bodytext === 'sudo clear') {
          await store.delete(uid)
          payload.text = 'current context is cleared.'
          tgPush(payload)
          return new Response("OK")
        }
        let userenv = await context.get(uid)
        
        if (CONFIG_EV2P.userid && CONFIG_EV2P.userid.length && CONFIG_EV2P.userid.indexOf(body.message.chat.id) === -1) {
          payload.text = "这是 " + CONFIG_EV2P.name + " 私人 bot，不接受其他人的指令。\n如果有兴趣可以自己搭建一个：https://github.com/elecV2/elecV2P-dei\n\n频道：@elecV2  交流群：@elecV2G"
          tgPush({
            ...payload,
            "chat_id": CONFIG_EV2P.userid,
            "text": `用户: ${body.message.chat.username}，ID: ${body.message.chat.id} 正在连接 elecV2P bot，发出指令为：${bodytext}。`
          })
        } else if (/^\/?end/.test(bodytext)) {
          await context.end(uid)
          payload.text = `退出上文执行环境${(userenv && userenv.context) || ''}，回到普通模式`
        } else if (/^\/?context$/.test(bodytext)) {
          if (userenv && userenv.context) {
            payload.text = '当前执行环境为：' + userenv.context + '\n输入 end 回到普通模式'
          } else {
            payload.text = '当前执行环境为：普通模式'
          }
        } else if (/^\/?status/.test(bodytext)) {
          payload.text = await getStatus()
        } else if (/^\/?(dellog|deletelog) /.test(bodytext)) {
          let cont = bodytext.replace(/^\/?(dellog|deletelog) /, '')
          if (!(cont === 'all' || /\.log$/.test(cont))) cont = cont + '.js.log'
          payload.text = await delLogs(cont)
        } else if (/^\/?taskinfo /.test(bodytext)) {
          let cont = bodytext.replace(/^\/?taskinfo /, '')
          payload.text = await getTaskinfo(cont)
        } else if (/^\/?log /.test(bodytext)) {
          let cont = bodytext.replace(/^\/?log /, '')
          if (!/\.log$/.test(cont)) cont = cont + '.js.log'
          payload.text = await getLogs(cont)
        } else if (/^\/?taskstart /.test(bodytext)) {
          let cont = bodytext.replace(/^\/?taskstart /, '')
          payload.text = await opTask(cont, 'start')
        } else if (/^\/?taskstop /.test(bodytext)) {
          let cont = bodytext.replace(/^\/?taskstop /, '')
          payload.text = await opTask(cont, 'stop')
        } else if (/^\/?taskdel /.test(bodytext)) {
          let cont = bodytext.replace(/^\/?taskdel /, '')
          payload.text = await opTask(cont, 'del')
        } else if (/^\/?tasksave/.test(bodytext)) {
          payload.text = await saveTask()
        } else if (/^\/?deljs /.test(bodytext)) {
          let cont = bodytext.replace(/^\/?deljs /, '')
          payload.text = await deleteJS(cont)
        } else if (/^\/?task/.test(bodytext)) {
          let cont = bodytext.trim().split(' ')
          if (cont.length === 1) {
            try {
              await context.put('u' + payload['chat_id'], 'task')
              let tasklists = await getTaskinfo('all')
              let keyb = {
                keyboard: [],
                resize_keyboard: false,
                one_time_keyboard: true,
                selective: true
              }
              tasklists.split(/\r|\n/).forEach((s, ind)=> {
                s = s.split(', ')
                if (s.length !== 4) return

                keyb.keyboard[ind] = [{
                  text: (s[3] === 'true' ? '🐢' : '🦇') + s[1] + ' ' + s[0]
                }]
              })
              payload.text = '进入 task 模式，点击开始/暂停任务。🐢 表示正在运行的任务，🦇 表示暂停中的任务。(ps: 操作后该任务列表的状态并不会立即变化)'
              payload.reply_markup = keyb
            } catch(e) {
              payload.text = e.message
            }
          } else {
            payload.text = 'unknow task operation'
          }
        } else if (/^\/?runjs/.test(bodytext)) {
          let cont = bodytext.trim().split(' ')
          if (cont.length === 1) {
            try {
              await context.put('u' + payload['chat_id'], 'runjs')
              let jslists = await getJsLists()
              let keyb = {
                keyboard: [],
                resize_keyboard: false,
                one_time_keyboard: true,
                selective: true
              }
              jslists.forEach((s, ind)=> {
                let row = parseInt(ind/2)
                keyb.keyboard[row]
                ? keyb.keyboard[row].push({
                  text: s.replace(/\.js$/, '')
                }) 
                : keyb.keyboard[row] = [{
                  text: s.replace(/\.js$/, '')
                }]
              })
              payload.text = '进入 runjs 模式，点击运行 JS，或直接输入远程链接'
              payload.reply_markup = keyb
            } catch(e) {
              payload.text = e.message
            }
          } else {
            payload.text = await jsRun(cont.pop())
          }
        } else if (/^\/?(shell|exec)/.test(bodytext)) {
          let cont = bodytext.trim().split(' ')
          if (cont.length === 1) {
            try {
              await context.put('u' + payload['chat_id'], 'shell')
              let keyb = {
                keyboard: [
                  [{text: 'ls'}, {text: 'node -v'}],
                  [{text: 'apk add python3 ffmpeg'}],
                  [{text: 'python3 -V'}, {text: 'pm2 ls'}]
                ],
                resize_keyboard: false,
                one_time_keyboard: false,
                selective: true
              }
              payload.text = '进入 shell 模式，可执行简单 shell 指令，比如：ls, node -v 等'
              payload.reply_markup = keyb
            } catch(e) {
              payload.text = e.message
            }
          } else {
            payload.text = await shellRun(bodytext.replace(/^\/?(shell|exec) /, ''))
          }
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
              text: s.replace(/\.js\.log$/g, ''),
              url: CONFIG_EV2P.url + 'log/' + s
            }) 
            : keyb.keyboard[row] = [{
              text: s.replace(/\.js\.log$/g, ''),
              url: CONFIG_EV2P.url + 'log/' + s
            }]
          })
          payload.text = "点击查看日志"
          payload.reply_markup = keyb
        } else if (userenv && userenv.context) {
          await context.put(uid, userenv.context, bodytext)
          switch (userenv.context) {
            case 'runjs':
              payload.text = await jsRun(bodytext)
              break
            case 'task':
              payload.text = await opTask(bodytext.split(' ').pop(), /^🐢/.test(bodytext) ? 'stop' : 'start')
              break
            case 'shell':
              if (Date.now() - context.active > (CONFIG_EV2P.shell && CONFIG_EV2P.shell.contexttimeout)) {
                payload.text = '已经超过' + CONFIG_EV2P.shell.contexttimeout + 'ms 没有执行 shell 指令，自动退出 shell 模式。使用 /shell 命令重新进入'
              } else {
                payload.text = await shellRun(bodytext)
              }
              break
            default: {
              payload.text = '未知执行环境' + userenv.context
            }
          }
        } else {
          payload.text = 'TGbot 部署成功，可以使用相关指令和 elecV2P 服务器进行交互了\nPowered By: https://github.com/elecV2/elecV2P\n\n频道: @elecV2 | 群组: @elecV2G'
        }

        await tgPush(payload)
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

async function tgPush(payload) {
  const myInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(payload)
  };

  let myRequest = new Request(`https://api.telegram.org/bot${CONFIG_EV2P.token}/`, myInit)

  await fetch(myRequest)
}