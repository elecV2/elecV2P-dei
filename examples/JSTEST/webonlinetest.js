// 网站是否在线监控

url = 'https://github.com/favicon.ico'  // 监控网址

new Promise(resolve => {
  let note = ''
  $axios(url).then(res=>{
    if (res.status !== 200) {
      $feed.ifttt('网站下线 - ' + res.status, '网址：' + url)
      console.log('网站下线', url, res.status)
      note = `网站下线 - ${res.status} ${url}`
    } else {
      console.log(url, '稳定运行中')
      note = url + ' 稳定运行中'
    }
  }).catch(e=>{
    $feed.ifttt(e.message, '无法访问网站: ' + url)
    console.log('无法访问网站', url, e.message)
    note = '无法访问网站: ' + url + e.message
  }).finally(()=>{
    resolve(note)
  })
})