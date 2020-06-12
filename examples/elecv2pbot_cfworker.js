function getLogs(s){
  let req = {
    url: "https://e2p.iwoglowo.cf/logs/"+s
  }
  
  return new Promise((resolve,reject)=>{
    fetch(req.url).then(res=>res.text()).then(r=>{
    resolve(r)
    })
  })
}

async function handlePostRequest(request) {
  let bodyString = await readRequestBody(request)

try {

    let body = JSON.parse(bodyString);

    const init = {
        headers: { 'content-type': 'application/json' },
    }

    if (body.message) {
        let payload = {
            "method": "sendMessage",
            "chat_id": body.message.chat.id,
            "text": "Only echo back text",
            "parse_mode": "markdown",
            "disable_web_page_preview": true,
        };
        if (body.message.text) {
            payload.text = await getLogs(body.message.text)
            if(/<\/a>/.test(payload.text)){
              let map = [...playload.text.matchAll(/>([A-z0-9\.]+)<\/a>/g)]
              let keyb={keyboard:[[{text: 'all'}]]}
              map.forEach((s, ind)=>{
                keyb.keyboard.push([{
                 text: map[ind][1]
                }])
              })
              payload.text = "请选择"
              payload.reply_markup = JSON.stringify(keyb)
            }
            const myInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            };

            let myRequest = new Request("https://api.telegram.org/bot816191002:AAFt0zcxP55lDk68sTXI5P4SZR9tWiYZAs8/", myInit)
            fetch(myRequest).then(function(x) {
                console.log(x);

            });


            return new Response("OK")
        } else {
            return new Response("OK")
        }

    } else {
        return new Response(JSON.stringify(body), init)
    }

}catch(e){
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