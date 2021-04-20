/**
 * 功能: 部署在 cloudflare worker 的 TGbot 后台代码，用于通过 telegram 查看/控制 elecV2P
 * 地址: https://github.com/elecV2/elecV2P-dei/blob/master/examples/TGbotonCFworker2.0.js
 * 更新: 2021-04-20
 * 
 * 使用方式: 
 * 1. 准备工作
 *    - elecV2P 服务器配置域名访问（测试: http://你的 elecV2P 服务器地址/webhook?token=你的webhook token&type=status ）
 *    - 注册并登录 https://dash.cloudflare.com/ ，创建一个 workers 和 KV Namespace(建议命名: elecV2P)，并进行绑定
 *    - 在 https://t.me/botfather 申请一个 TG BOT，记下 api token
 *
 * 2. 部署代码
 *    - 根据下面代码中 CONFIG_EV2P 的注释，填写好相关内容
 *    - 然后把修改后的整个 JS 内容粘贴到 cloudflare worker 代码框，保存并部署。得到一个类似 https://xx.xxxxx.workers.dev 的网址
 *    - 接着在浏览器中打开链接: https://api.telegram.org/bot(你的 tgbot token)/setWebhook?url=https://xx.xxxxx.workers.dev（连接 TGbot 和 CFworkers）
 *    - 最后，打开 TGbot 对话框，输入下面的相关指令（比如 status），测试 TGbot 是否部署成功
 *
 * 2.0 更新: 添加上下文执行环境
 * - /runjs   进入脚本执行环境，接下来直接输入文件名或远程链接则可直接运行
 * - /task    进入任务操作环境，获取相关任务的 taskid 可暂停/开始定时任务
 * - /shell   进入 shell 执行环境，默认 timeout 为 3000ms（elecV2P v3.2.4 版本后生效）
 * - /log     进入 日志查看模式
 * - /context 获取当前执行环境，如果没有，则为普通模式
 * 其它模式完善中...
 * 
 * 特殊指令 sudo clear ; 用于清空当前 context 值（以防服务器长时间无返回而卡死的问题）
 *
 * 下面 /command 命令的优先级高于当前执行环境
 *
 * 实现功能及相关指令: 
 * 查看 elecV2P 运行状态
 * status === /status  ;任何包含 status 关键字的指令
 *
 * 查看服务器相关信息（elecV2P v3.2.6 版本后适用）
 * /info
 * /info debug
 * 
 * 删除 log 文件
 * /deletelog file === /deletelog file.js.log === /dellog file
 * /dellog all  ;删除使用 log 文件
 *
 * 查看 log 文件
 * /log file
 *
 * 定时任务相关
 * /taskinfo all        ;获取所有任务信息
 * /taskinfo taskid     ;获取单个任务信息
 * /taskstart taskid    ;开始任务
 * /taskstop taskid     ;停止任务
 * /taskdel taskid      ;删除任务
 * /tasksave            ;保存当前任务列表
 * 
 * 脚本相关
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
info - 查看服务器信息
command - 列出所有指令

 * 更新方式: 
 * - 如果在 CONFIG_EV2P 中设置了 store，直接复制当前整个文件到 cf worker 即可
 * - 如果没有设置 store，则复制除了开头的 CONFIG_EV2P 外其他所有内容到 cf worker
**/

const kvname = elecV2P   // 保存上下文内容的 kv namespace。在 cf 上创建并绑定后自行更改

let CONFIG_EV2P = {
  name: 'elecV2P',              // bot 名称。可省略
  store: 'elecV2PBot_CONFIG',   // 是否将当前 CONFIG 设置保存到 kv 库（运行时会自动读取并覆盖下面的设置，即下面的设置更改无效（方便更新)。建议调试时留空，调试完成后再设置回 'elecV2PBot_CONFIG' ）
  storeforce: false,     // true: 使用当前设置强制覆盖 cf kv 库中的数据，false: kv 库中有配置相关数据则读取，没有则使用当前设置运行并保存
  url: "http://你的 elecV2P 服务器地址/",    // elecV2P 服务器地址(必须是域名，cf worker 不支持 IP 直接访问)
  wbrtoken: 'xxxxxx-xxxxxxxxxxxx-xxxx',      // elecV2P 服务器 webhook token(在 webUI->SETTING 界面查看)
  token: "xxxxxxxx:xxxxxxxxxxxxxxxxxxx",     // telegram bot api token
  slice: -1200,          // 截取日志最后 1200 个字符，以防太长无法传输（可自行修改）
  userid: [],            // 只对该列表中的 userid 发出的指令进行回应。默认: 回应所有用户的指令
  shell: {
    timeout: 1000*6,     // shell exec 超时时间，单位: ms
    contexttimeout: 1000*60*5,               // shell 模式自动退出时间，单位: ms
  },
  timeout: 5000,         // runjs 请求超时时间，以防请求时间过长，导致反复请求，bot 被卡死
  mycommand: {           // 自定义快捷命令，比如 restart: 'exec pm2 restart elecV2P'
    rtest: '/runjs test.js',    // 表示当输入命令 /rtest 或 rtest 时会自动替换成命令 '/runjs test.js' 运行 JS 脚本 test.js
    execls: 'exec ls -al',      // 同上，表示自动将命令 /execls 替换成 exec ls -al。 其他命令可参考自行添加
  },
}

/************ 后面部分为主运行代码，若没有特殊情况，无需改动 ****************/

const store = {
  put: async (key, value)=>{
    return await kvname.put(key, value)
  },
  get: async (key, type)=>{
    return await kvname.get(key, type)
  },
  delete: async (key)=>{
    await kvname.delete(key)
  },
  list: async ()=>{
    const val = await kvname.list()
    return val.keys
  }
}

const context = {
  get: async (uid) => {
    return await store.get(uid, 'json')
  },
  put: async (uid, uenv, command) => {
    let ctx = await context.get(uid)
    if (ctx === null || typeof ctx !== 'object') {
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

function timeoutPromise(timeout = CONFIG_EV2P.timeout || 5000) {
  return new Promise(resolve => setTimeout(resolve, timeout, '请求超时 ' + timeout + ' ms，相关请求应该已发送至 elecV2P，这里提前返回结果，以免发送重复请求'))
}

function getLogs(s){
  if (s !== 'all' && !/\.log$/.test(s)) {
    s = s + '.js.log'
  }
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

function getInfo(debug) {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?type=info&token=' + CONFIG_EV2P.wbrtoken + (debug ? '&debug=true' : '')).then(res=>res.text()).then(r=>{
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
  if (!fn.startsWith('http') && !/\.js$/.test(fn)) {
    fn += '.js'
  }

  return Promise.race([new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=runjs&fn=' + fn).then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  }), timeoutPromise()])
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
    return '请输入 command 指令，比如: ls'
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
  if (CONFIG_EV2P.store) {
    let config = await store.get(CONFIG_EV2P.store, 'json')
    if (!CONFIG_EV2P.storeforce && config) {
      Object.assign(CONFIG_EV2P, config)
    } else {
      await store.put(CONFIG_EV2P.store, JSON.stringify(CONFIG_EV2P))
    }
  }
  if (!CONFIG_EV2P.url.endsWith('/')) {
    CONFIG_EV2P.url = CONFIG_EV2P.url + '/'
  }
  CONFIG_EV2P.timeout = CONFIG_EV2P.timeout || 5000

  let bodyString = await readRequestBody(request)
  let payload = {
    "method": "sendMessage",
    "chat_id": CONFIG_EV2P.userid[0],
    "parse_mode": "html",
    "disable_web_page_preview": true,
  }

  try {
    let body = JSON.parse(bodyString)
    payload["chat_id"] = body.message.chat.id
    if (body.message && body.message.text) {
      let bodytext = body.message.text.trim()
      let uid = 'u' + payload['chat_id']

      if (CONFIG_EV2P.mycommand && Object.keys(CONFIG_EV2P.mycommand).length) {
        let tcom = bodytext.replace(/^\//, '')
        if (CONFIG_EV2P.mycommand[tcom]) {
          bodytext = CONFIG_EV2P.mycommand[tcom]
        }
      }
      if (bodytext === 'sudo clear') {
        await store.delete(uid)
        payload.text = 'current context is cleared.'
        tgPush(payload)
        return new Response("OK")
      } else if (bodytext === '/command') {
        payload.text = `/runjs - 运行 JS
/task - 开始暂停任务
/status - 内存使用状态
/shell - 执行简单 shell 指令
/end - end context
/tasksave - 保存任务列表
/taskdel - 删除任务
/deljs - 删除 JS
/dellog - 删除日志
/log - 获取日志
/context - 查看当前执行模式
/info - 查看服务器信息
/command - 列出所有指令`

        if (CONFIG_EV2P.mycommand && Object.keys(CONFIG_EV2P.mycommand).length) {
          payload.text += '\n\n自定义快捷命令'
          for (let x in CONFIG_EV2P.mycommand) {
            payload.text += '\n' + (x.startsWith('/') ? '' : '/') + x + ' - ' + CONFIG_EV2P.mycommand[x]
          }
        }
        tgPush(payload)
        return new Response("OK")
      }
      let userenv = await context.get(uid)
      
      if (CONFIG_EV2P.userid && CONFIG_EV2P.userid.length && CONFIG_EV2P.userid.indexOf(body.message.chat.id) === -1) {
        payload.text = "这是 " + CONFIG_EV2P.name + " 私人 bot，不接受其他人的指令。\n如果有兴趣可以自己搭建一个: https://github.com/elecV2/elecV2P-dei\n\n频道: @elecV2 | 交流群: @elecV2G"
        tgPush({
          ...payload,
          "chat_id": CONFIG_EV2P.userid[0],
          "text": `用户: ${body.message.chat.username}，ID: ${body.message.chat.id} 正在连接 elecV2P bot，发出指令为: ${bodytext}`
        })
      } else if (/^\/?end/.test(bodytext)) {
        await context.end(uid)
        payload.text = `退出上文执行环境${(userenv && userenv.context) || ''}，回到普通模式`
      } else if (/^\/?context$/.test(bodytext)) {
        if (userenv && userenv.context) {
          payload.text = '当前执行环境为: ' + userenv.context + '\n输入 end 回到普通模式'
        } else {
          payload.text = '当前执行环境为: 普通模式'
        }
      } else if (/^\/?status/.test(bodytext)) {
        payload.text = await getStatus()
      } else if (/^\/?info/.test(bodytext)) {
        let cont = bodytext.trim().split(' ')
        if (cont.length === 1) {
          payload.text = await getInfo()
        } else if (cont.pop() === 'debug') {
          payload.text = await getInfo('debug')
        } else {
          payload.text = 'unknow info command'
        }
      } else if (/^\/?(dellog|deletelog) /.test(bodytext)) {
        let cont = bodytext.replace(/^\/?(dellog|deletelog) /, '')
        if (!(cont === 'all' || /\.log$/.test(cont))) cont = cont + '.js.log'
        payload.text = await delLogs(cont)
      } else if (/^\/?taskinfo /.test(bodytext)) {
        let cont = bodytext.replace(/^\/?taskinfo /, '')
        payload.text = await getTaskinfo(cont)
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
            let tlist = JSON.parse(tasklists)
            let tlstr = ''
            for (let tid in tlist.info) {
              tlstr += `${tlist.info[tid].name}, tid: ${tid}, running: ${tlist.info[tid].running}\n`
            }
            tlstr += `共 ${tlist.total} 个定时任务，运行中的任务 ${tlist.running} 个`
            tasklists = tlstr

            payload.text = `当前 elecV2P 任务列表如下:\n${tasklists}\n输入任务对应的 tid 开始任务，输入 stop tid 停止任务`
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
            payload.text = '进入 RUNJS 模式，当前 elecV2P 上 JS 文件数: ' + jslists.length + '\n点击运行 JS，也可以直接输入文件名或者远程链接'
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
              one_time_keyboard: true,
              selective: true
            }
            payload.text = '进入 SHELL 模式，可执行简单 shell 指令，比如: ls, node -v 等'
            payload.reply_markup = keyb
          } catch(e) {
            payload.text = e.message
          }
        } else {
          payload.text = await shellRun(bodytext.replace(/^\/?(shell|exec) /, ''))
        }
      } else if (/^\/?log/.test(bodytext)) {
        let cont = bodytext.trim().split(' ')
        if (cont.length === 1) {
          try {
            await context.put('u' + payload['chat_id'], 'log')
            let res = await getLogs('all')
            let map = JSON.parse(res)
            let keyb = {
                  inline_keyboard: [ ],
                }

            map.forEach((s, ind)=> {
              let row = parseInt(ind/2)
              keyb.inline_keyboard[row]
              ? keyb.inline_keyboard[row].push({
                text: s.replace(/\.js\.log$/g, ''),
                url: CONFIG_EV2P.url + 'logs/' + s
              }) 
              : keyb.inline_keyboard[row] = [{
                text: s.replace(/\.js\.log$/g, ''),
                url: CONFIG_EV2P.url + 'logs/' + s
              }]
            })
            payload.text = "进行日志查看模式，当前 elecV2P 上日志文件数: " + map.length + "\n点击查看日志或者直接输入 log 文件名进行查看"
            payload.reply_markup = keyb
          } catch(e) {
            payload.text = e.message
          }
        } else {
          payload.text = await getLogs(bodytext.replace(/^\/?log /, ''))
        }
      } else if (userenv && userenv.context) {
        switch (userenv.context) {
          case 'log':
            payload.text = await getLogs(bodytext)
            break
          case 'runjs':
            payload.text = await jsRun(bodytext)
            break
          case 'task':
            payload.text = await opTask(bodytext.split(' ').pop(), /^(🐢|stop)/.test(bodytext) ? 'stop' : 'start')
            break
          case 'shell':
            if (Date.now() - userenv.active > (CONFIG_EV2P.shell && CONFIG_EV2P.shell.contexttimeout)) {
              payload.text = '已经超过 ' + CONFIG_EV2P.shell.contexttimeout/1000/60 + ' 分钟没有执行 shell 指令，自动退出 shell 模式\n使用 /shell 命令重新进入\n/end 回到普通模式\n/command 查看所有指令'
              payload.reply_markup = JSON.stringify({
                remove_keyboard: true
              })
              userenv.context = 'normal'
            } else {
              payload.text = await shellRun(bodytext)
            }
            break
          default: {
            payload.text = '当前执行环境: ' + userenv.context + ' 无法处理指令: ' + bodytext
          }
        }
        await context.put(uid, userenv.context, bodytext)
      } else {
        payload.text = 'TGbot 部署成功，可以使用相关指令和 elecV2P 服务器进行交互了\nPowered By: https://github.com/elecV2/elecV2P\n\n频道: @elecV2 | 交流群: @elecV2G'
        if (bodytext === '/start') {
          let status = ''
          try {
            status = await getStatus()
          } catch(e) {
            status = (e.message || e) + '\nelecV2P 服务器没有响应，请检查服务器地址和 webhook token 是否设置正确。'
          }
          payload.text += '\n' + status
        }
      }

      await tgPush(payload)
      return new Response("OK")
    }
    return new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json' },
    })
  } catch(e) {
    payload.text = e.message || e
    tgPush(payload)
    return new Response("OK")
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