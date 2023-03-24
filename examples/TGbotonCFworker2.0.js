/**
 * 功能: 部署在 cloudflare worker 的 TGbot 后台代码，用于通过 telegram 查看/控制 elecV2P
 * 地址: https://github.com/elecV2/elecV2P-dei/blob/master/examples/TGbotonCFworker2.0.js
 * 更新: 2022-02-19
 * 说明: 功能实现主要基于 elecV2P 的 webhook（https://github.com/elecV2/elecV2P-dei/tree/master/docs/09-webhook.md）
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
 *    - 接着在浏览器中打开链接: https://api.telegram.org/bot(你的 tgbot token)/setWebhook?url=https://xx.xxxxx.workers.dev （连接 TGbot 和 CFworkers）
 *    - 最后，打开 TGbot 对话框，输入下面的相关指令（比如 status），测试 TGbot 是否部署成功
 *
 * 2.0 更新: 添加上下文执行环境
 * - /runjs   进入脚本执行环境，接下来直接输入文件名或远程链接则可直接运行
 * - /task    进入任务操作环境，获取相关任务的 taskid 可暂停/开始/添加定时任务
 * - /shell   进入 shell 执行环境，默认 timeout 为 3000ms（elecV2P v3.2.4 版本后生效）
 * - /log     进入 日志查看模式
 * - /store   进入 store/cookie 管理模式。默认处于关闭状态，可在 CONFIG_EV2P mode 设置开启
 * - /context 获取当前执行环境，如果没有，则为普通模式
 * 其它模式完善中...
 * 
 * 特殊指令 sudo clear ; 用于清空当前 context 值（以防出现服务器长时间无返回而卡死的问题）
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
 * /runjs https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/feed.js anotify.js  ;运行远程脚本同时重命名保存为 anotify.js
 * /deljs file.js       ;删除脚本
 *
 * shell 指令相关
 * /exec ls  ===  /shell ls  ===  exec ls
 * exec pm2 ls
 * 
 * bot commands 2.0
runjs - 运行 JS
task - 任务管理模式
status - 内存使用状态
shell - shell 命令执行模式
store - store/cookie 管理
tasksave - 保存任务列表
log - 查看日志文件
context - 查看当前执行环境
end - 退出当前执行环境
info - 查看服务器信息
command - 列出所有指令

 * 更新方式: 
 * - 如果在 CONFIG_EV2P 中设置了 store，直接复制当前整个文件到 cf worker 即可
 * - 如果没有设置 store，则复制除了开头的 CONFIG_EV2P 外其他所有内容到 cf worker
 *
 * 适用版本: elecV2P v3.3.6 (低版本下部分指令可能无法正常处理)
**/

const kvname = elecV2P   // 保存上下文内容的 kv namespace。在 cf 上创建并绑定后自行更改

let CONFIG_EV2P = {
  name: 'elecV2P',              // bot 名称。可省略
  store: 'elecV2PBot_CONFIG',   // 是否将当前 CONFIG 设置保存到 kv 库（运行时会自动读取并覆盖下面的设置，即下面的设置更改无效（方便更新)。建议调试时留空，调试完成后再设置回 'elecV2PBot_CONFIG' ）
  storeforce: false,     // true: 使用当前设置强制覆盖 cf kv 库中的数据，false: kv 库中有配置相关数据则读取，没有则使用当前设置运行并保存
  url: "http://你的 elecV2P 服务器地址/",    // elecV2P 服务器地址(必须是域名，cf worker 不支持 IP 直接访问)
  wbrtoken: 'xxxxxx-xxxxxxxxxxxx-xxxx',      // elecV2P 服务器 webhook token(在 webUI->SETTING 界面查看)
  token: "xxxxxxxx:xxxxxxxxxxxxxxxxxxx",     // telegram bot api token
  userid: [],            // 只对该列表中的 userid 发出的指令进行回应。默认: 回应所有用户的指令（高风险！）
  slice: -1200,          // 截取部分返回结果的最后 1200 个字符，以防太长无法传输（可自行修改）
  shell: {
    timeout: 1000*6,     // shell exec 超时时间，单位: ms
    contexttimeout: 1000*60*5,               // shell 模式自动退出时间，单位: ms
  },
  timeout: 5000,         // runjs 请求超时时间，以防脚本运行时间过长，无回应导致反复请求，bot 被卡死
  mycommand: {           // 自定义快捷命令，比如 restart: 'exec pm2 restart elecV2P'。前面的属性值请不要包含空格。
    rtest: '/runjs test.js',    // 表示当输入命令 /rtest 或 rtest 时会自动替换成命令 '/runjs test.js' 运行 JS 脚本 test.js
    execls: 'exec ls -al',      // 同上，表示自动将命令 /execls 替换成 exec ls -al。 其他命令可参考自行添加
    update: {                   // 当为 object 类型时，note 表示备注显示信息， command 表示实际执行命令
      note: '软更新升级',
      command: 'runjs https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/softupdate.js'
    },
    renv: {
      note: '带参数运行',       // 在 command 中用 $1 作为占位符
      command: 'runjs exam-js-env.js -env name=$1',  // 使用示例: renv 参数elecV2PTGbot。目前仅支持单个参数
    },
  },
  mode: {
    storemanage: false,         // 是否开启 store/cookie 管理模式。false: 不开启（默认），true: 开启
  }
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
  end: async (uid) => {
    await store.put(uid, JSON.stringify({}))
  }
}

function surlName(url) {
  if (!url) {
    return ''
  }
  let name = ''
  let sdurl = url.split(/\/|\?|#/)
  while (name === '' && sdurl.length) {
    name = sdurl.pop()
  }
  return name
}

function timeoutPromise({ timeout = CONFIG_EV2P.timeout || 5000, fn }) {
  if (!/\.js$/.test(fn)) {
    fn += '.js'
  }
  return new Promise(resolve => setTimeout(resolve, timeout, '请求超时 ' + timeout + ' ms，相关请求应该已发送至 elecV2P，这里提前返回结果，以免发送重复请求' + `${fn ? ('\n\n运行日志: ' + CONFIG_EV2P.url + 'logs/' + surlName(fn) + '.log') : '' }`))
}

function getLogs(s){
  if (s !== 'all' && !/\.log$/.test(s)) {
    s = s + '.js.log'
  }
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=getlog&fn=' + s).then(res=>res.text()).then(r=>{
      resolve(s === 'all' ? r : r.slice(CONFIG_EV2P.slice))
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
  tid = tid.replace(/^\//, '')
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
  tid = tid.replace(/^\//, '')
  if (/^\/?stop/.test(tid)) {
    op = 'stop'
    tid = tid.replace(/^\/?stop/, '')
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

function taskNew(taskinfo) {
  // 新建任务
  if (!taskinfo) {
    return '没有任何任务信息'
  }
  let finfo = taskinfo.split(/\r|\n/)
  if (finfo.length < 2) {
    return '任务信息输入有误 '
  }
  taskinfo = {
    name: finfo[2] || '新的任务' + Math.ceil(Math.random()*100),
    type: finfo[0].split(' ').length > 4 ? 'cron' : 'schedule',
    time: finfo[0],
    job: {
      type: finfo[3] || 'runjs',
      target: finfo[1],
    },
    running: finfo[4] !== 'false'
  }
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: CONFIG_EV2P.wbrtoken,
        type: 'taskadd',
        task: taskinfo
      })
    }).then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  })
}

function jsRun(fn) {
  // 支持参数运行，参考说明文档 06-task.md 运行 JS 相关部分（elecV2P 需大于 v3.6.0
  return Promise.race([new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=runjs&fn=' + encodeURI(fn)).then(res=>res.text()).then(r=>{
      resolve(r)
    }).catch(e=>{
      reject(e)
    })
  }), timeoutPromise({ fn })])
}

function getJsLists() {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=jslist').then(res=>res.json()).then(r=>{
      resolve(r.rescode === 0 ? r.resdata : r)
    }).catch(e=>{
      reject(e)
    })
  })
}

function deleteJS(name) {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=deletejs&fn=' + name).then(res=>res.text()).then(r=>{
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

function storeManage(keyvt) {
  if (!keyvt) {
    return '请输入要获取的 cookie/store 相关的 key 值'
  }

  let keys = keyvt.split(' ')
  if (keys.length === 1) {
    return new Promise((resolve,reject)=>{
      fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + `&type=store&key=${keyvt}`).then(res=>res.text()).then(r=>{
        if (r) {
          resolve(r.slice(CONFIG_EV2P.slice))
        } else {
          resolve(keyvt + ' 暂不存在')
        }
      }).catch(e=>{
        reject(e)
      })
    })
  } else {
    let body = {
      token: CONFIG_EV2P.wbrtoken,
      type: 'store'
    }
    if (keys[0] === 'delete') {
      body.op = 'delete'
      body.key = keys[1]
    } else {
      body.op = 'put'
      body.key = keys[0]
      body.value = decodeURI(keys[1])
      body.options = {
        type: keys[2]
      }
    }
    return new Promise((resolve,reject)=>{
      fetch(CONFIG_EV2P.url + 'webhook', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then(res=>res.text()).then(r=>{
        resolve(r)
      }).catch(e=>{
        reject(e)
      })
    })
  }
}

function storeList() {
  return new Promise((resolve,reject)=>{
    fetch(CONFIG_EV2P.url + 'webhook?token=' + CONFIG_EV2P.wbrtoken + '&type=store&op=all').then(res=>res.json()).then(r=>{
      resolve(r.rescode === 0 ? r.resdata : r)
    }).catch(e=>{
      reject(e)
    })
  })
}

function getFile(file_id) {
  return new Promise((resolve,reject)=>{
    fetch(`https://api.telegram.org/bot${CONFIG_EV2P.token}/getFile?file_id=${file_id}`).then(res=>res.json()).then(r=>{
      if (r.ok) {
        resolve(`https://api.telegram.org/file/bot${CONFIG_EV2P.token}/${r.result.file_path}`)
      } else {
        resolve(r.description)
      }
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
    if (!body.message) {
      payload.text = 'elecV2P bot get unknow message:\n' + bodyString
      await tgPush(payload)
      return new Response("OK")
    }
    payload["chat_id"] = body.message.chat.id
    if (body.message.document) {
      let bodydoc = body.message.document
      payload.text = `文件名称: ${bodydoc.file_name}\n文件类型: ${bodydoc.mime_type}\n文件 id: ${bodydoc.file_id}\n`
      let fpath = await getFile(bodydoc.file_id)
      payload.text += `文件地址: ${fpath}\n\n（进一步功能待完成）`
      await tgPush(payload)
      return new Response("OK")
    }
    if (body.message.text) {
      let bodytext = body.message.text.trim()
      let uid = 'u' + payload['chat_id']

      if (CONFIG_EV2P.mycommand && Object.keys(CONFIG_EV2P.mycommand).length) {
        let tcom = bodytext.replace(/^\//, '')
        if (CONFIG_EV2P.mycommand[tcom]) {
          bodytext = CONFIG_EV2P.mycommand[tcom].command || CONFIG_EV2P.mycommand[tcom]
        } else if (tcom.indexOf(' ') !== -1) {
          let tind = tcom.indexOf(' ')
          let fcom = tcom.slice(0, tind)
          if (CONFIG_EV2P.mycommand[fcom]) {
            let otext = CONFIG_EV2P.mycommand[fcom].command || CONFIG_EV2P.mycommand[fcom]
            if (/\$1/.test(otext)) {
              bodytext = otext.replace(/\$1/, tcom.slice(tind+1))
            }
          }
        }
      }
      if (bodytext === 'sudo clear') {
        await store.delete(uid)
        payload.text = 'current context is cleared.'
        await tgPush(payload)
        return new Response("OK")
      } else if (bodytext === '/command') {
        payload.text = `/runjs - 运行 JS
/task - 任务管理模式
/status - 内存使用状态
/shell - shell 指令执行模式
/store - store/cookie 管理
/tasksave - 保存任务列表
/taskdel + tid - 删除任务
/deljs + JS 文件名 - 删除 JS
/log - 获取日志
/dellog + 日志名 - 删除日志
/context - 查看当前执行环境
/end - 退出当前执行环境
/info - 查看服务器信息
/command - 列出所有指令`

        if (CONFIG_EV2P.mycommand && Object.keys(CONFIG_EV2P.mycommand).length) {
          payload.text += '\n\n自定义快捷命令'
          for (let x in CONFIG_EV2P.mycommand) {
            payload.text += '\n' + (x.startsWith('/') ? '' : '/') + x + ' - ' + (CONFIG_EV2P.mycommand[x].note || CONFIG_EV2P.mycommand[x])
          }
        }
        await tgPush(payload)
        return new Response("OK")
      }
      let userenv = await context.get(uid)
      
      if (CONFIG_EV2P.userid && CONFIG_EV2P.userid.length && CONFIG_EV2P.userid.indexOf(body.message.chat.id) === -1) {
        payload.text = "这是 " + CONFIG_EV2P.name + " 私人 bot，不接受其他人的指令。\n如果有兴趣可以自己搭建一个: https://github.com/elecV2/elecV2P-dei\n\n频道: @elecV2 | 交流群: @elecV2G"
        await tgPush({
          ...payload,
          "chat_id": CONFIG_EV2P.userid[0],
          "text": `用户: ${body.message.chat.username}，ID: ${body.message.chat.id} 正在连接 elecV2P bot，发出指令为: ${bodytext}`
        })
      } else if (/^\/?end/.test(bodytext)) {
        await context.end(uid)
        payload.text = `退出上文执行环境${(userenv && userenv.context) || ''}，回到普通模式`
      } else if (/^\/?context$/.test(bodytext)) {
        if (userenv && userenv.context) {
          payload.text = '当前执行环境为: ' + userenv.context + '\n输入 /end 回到普通模式'
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
      } else if (/^\/?taskinfo/.test(bodytext)) {
        let cont = bodytext.replace(/^\/?taskinfo/, '')
        payload.text = await getTaskinfo(cont.trim() || 'all')
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
            let tlstr = []
            for (let tid in tlist.info) {
              tlstr.push(`${tlist.info[tid].running ? '🐢' : '🐰'} ${tlist.info[tid].name} /${tid}  |  /stop${tid}`)
              if (tlstr.length > 80) {
                payload.text = tlstr.join('\n')
                await tgPush(payload)
                tlstr = []
              }
            }

            payload.text = `\n${tlstr.join('\n')}\n当前 elecV2P 定时任务共 ${tlist.total} 个，运行中(🐢)的任务 ${tlist.running} 个\n点击任务名后面的 /+tid 开始任务，/+stoptid 停止任务\n也可以手动输入对应的 tid 开始任务, stop tid 停止任务\ntaskinfo tid 查看任务信息`
            await tgPush(payload)

            payload.text = `按照下面格式多行输入可直接添加新的任务（每行表示一个任务参数）\n
任务时间(cron 定时，比如: 8 0,8 * * * ，倒计时，比如: 1 10 6)
任务目标(test.js，node -v, LOlxkcdI(某个任务的 tid)，远程 JS 链接等)
任务名称(可省略，默认为 新的任务+随机参数)
任务类型(可省略，默认为 运行 JS，shell: 运行 shell 指令，taskstart：开始其他任务，taskstop：停止其他任务)
是否执行(可省略，默认为 true，当且仅当该值为 false 时，表示只添加任务信息而不运行)

示例一：添加一个 cron 定时任务

30 20 * * *
https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/deletelog.js
删除日志

示例二：添加一个倒计时任务，运行 test.js，每次倒计时 1 秒，执行 3 次

1 3
test.js`
          } catch(e) {
            payload.text = e.message
          }
        } else {
          payload.text = 'unknow task operation'
        }
      } else if (/^\/?runjs/.test(bodytext)) {
        let cont = bodytext.trim().split(/ +/)
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
            let over = ''
            if (jslists.length >= 200) {
              over = '\n\n文件数超过 200，以防 reply_keyboard 过长 TG 无返回，剩余 JS 以文字形式返回\n\n'
            }
            for (let ind in jslists) {
              let s = jslists[ind]
              if (ind >= 200) {
                over += s + '  '
                continue
              }

              let row = parseInt(ind/2)
              keyb.keyboard[row]
              ? keyb.keyboard[row].push({
                text: s.replace(/\.js$/, '')
              })
              : keyb.keyboard[row] = [{
                text: s.replace(/\.js$/, '')
              }]
            }
            payload.text = '进入 RUNJS 模式，当前 elecV2P 上 JS 文件数: ' + jslists.length + '\n点击交互键盘可直接运行 JS，也可以输入文件名或者远程链接运行其他脚本\n后面可附带 -env/-rename 等参数(v3.6.0)，比如\nhttps://远程JSname.js -rename=t.js' + over.trimRight()
            payload.reply_markup = keyb
          } catch(e) {
            payload.text = e.message
          }
        } else {
          payload.text = await jsRun(bodytext.replace(/^\/?runjs /, ''))
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
      } else if (/^\/?store/.test(bodytext)) {
        if (CONFIG_EV2P.mode && CONFIG_EV2P.mode.storemanage) {
          let cont = bodytext.trim().split(' ')
          if (cont.length === 1) {
            try {
              await context.put('u' + payload['chat_id'], 'store')
              let storelists = await storeList()
              let keyb = {
                keyboard: [],
                resize_keyboard: false,
                one_time_keyboard: true,
                selective: true
              }
              let over = ''
              if (storelists.length >= 200) {
                over = '\n\nCookie 数超过 200，以防 reply_keyboard 过长 TG 无返回，剩余 Cookie KEY 以文字形式返回\n\n'
              }
              for (let ind in storelists) {
                let s = storelists[ind]
                if (ind >= 200) {
                  over += s + '  '
                  continue
                }

                let row = parseInt(ind/2)
                keyb.keyboard[row]
                ? keyb.keyboard[row].push({
                  text: s
                })
                : keyb.keyboard[row] = [{
                  text: s
                }]
              }
              payload.reply_markup = keyb
              payload.text = '进入 cookie/store 管理模式，当前 elecV2P 上 Cookie 数: ' + storelists.length + '\n\n点击或者直接输入关键字(key)查看 store 内容，比如 cookieKEY\n\n输入 delete key 删除某个 Cookie。比如: delete cookieKEY\n\n输入 key value type(可省略) 修改 store 内容(以空格进行分隔)。如果 value 中包含空格等其他特殊字符，请先使用 encodeURI 函数进行转换。比如:\n\nCookieJD pt_pin=xxx;%20pt_key=app_xxxxxxx;\n\ntype 可省略，也可设定为:\nstring 表示将 value 保存为普通字符(默认)\nobject 表示将 value 保存为 json 格式\na 表示在原来的值上新增。（更多说明可参考 https://github.com/elecV2/elecV2P-dei/tree/master/docs/04-JS.md $store 部分）' + over
            } catch(e) {
              payload.text = e.message
            }
          } else {
            payload.text = await storeManage(bodytext.replace(/^\/?store /, ''))
          }
        } else {
          payload.text = 'store/cookie 管理模式处于关闭状态'
        }
      } else if (/^\/?log/.test(bodytext)) {
        let cont = bodytext.trim().split(' ')
        if (cont.length === 1) {
          try {
            await context.put('u' + payload['chat_id'], 'log')
            let res = await getLogs('all')
            let map = JSON.parse(res)
            if (map.rescode === 0) {
              map = map.resdata
            }
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
            payload.text = "开始日志查看模式，当前 elecV2P 上日志文件数: " + map.length + "\n点击查看日志或者直接输入 log 文件名进行查看"
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
            if (bodytext.trim().split(/\r|\n/).length > 1) {
              payload.text = await taskNew(bodytext)
            } else {
              payload.text = await opTask(bodytext.split(' ').pop(), /^(🐢|\/?stop)/.test(bodytext) ? 'stop' : 'start')
            }
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
          case 'store':
            if (CONFIG_EV2P.mode && CONFIG_EV2P.mode.storemanage) {
              payload.text = await storeManage(bodytext)
            } else {
              payload.text = 'store/cookie 管理模式处于关闭状态'
            }
            break
          default: {
            payload.text = '当前执行环境: ' + userenv.context + ' 无法处理指令: ' + bodytext
          }
        }
        await context.put(uid, userenv.context, bodytext)
      } else {
        payload.text = 'TGbot 部署成功，可以使用相关指令和 elecV2P 服务器进行交互了\nPowered By: https://github.com/elecV2/elecV2P\n\n频道: @elecV2 | 交流群: @elecV2G'
        if (CONFIG_EV2P.userid.length === 0) {
          payload.text += '\n（❗️危险⚠️）当前 elecV2P bot 并没有设置 userid，所有人可进行交互'
        }
        if (bodytext === '/start') {
          let status = ''
          try {
            status = await getStatus()
            status = '当前 bot 与 elecV2P 连接成功 ' + status
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
    console.error(e)
    console.log('payload', payload)
    payload.text = JSON.stringify({
      rescode: -1,
      message: e.message || e,
      resdata: bodyString
    }, null, 2)
    await tgPush(payload)
    return new Response("OK")
  }
}

async function handleRequest(request) {
  return new Response(JSON.stringify({
    rescode: 0,
    message: `welcome to elecV2P.\n\nPowered By: https://github.com/elecV2/elecV2P\n\nTG 频道: https://t.me/elecV2 | TG 交流群: @elecV2G`
  }, null, 2))
}

addEventListener('fetch', event => {
  const { request } = event
  // const { url } = request
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
    }
  };
  let maxbLength = 1200;
  if (payload.text && payload.text.length > maxbLength) {
    let reply_text = payload.text
    let pieces = Math.ceil(reply_text.length / maxbLength);
    for (let i=0; i<pieces; i++) {
      payload.text = reply_text.slice(i*maxbLength, (i+1)*maxbLength);
      myInit.body = JSON.stringify(payload)
      let myRequest = new Request(`https://api.telegram.org/bot${CONFIG_EV2P.token}/`, myInit);
      await fetch(myRequest);
      if (payload.reply_markup) {
        delete payload.reply_markup
      }
    }
  } else {
    myInit.body = JSON.stringify(payload);
    let myRequest = new Request(`https://api.telegram.org/bot${CONFIG_EV2P.token}/`, myInit);
    await fetch(myRequest);
  }
}