// 提前在服务器配置好 aria2 环境

// task runjs example:
// 运行 JS: aria2-env.js -e dlink=https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/webhook.js

let dlink = 'https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/0body.js'
if (typeof($dlink) !== "undefined") {
  dlink = $dlink
}

$exec(`aria2c ${dlink} -d ${__efss}`, {
  call: true,
  cb(data, error, success){
    if (success) {
      console.log('aria2 download complete!', 'dlink:' + dlink)
      $feed.ifttt('aria2 download complete!', 'dlink:' + dlink, __home + '/efss')
    } else {
      error ? console.error(error) : console.log(data)
    }
  }
})