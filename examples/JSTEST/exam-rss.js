// 使用 cheerio 解析 rss 的小例子
// iOS 限免软件推送。需要先设置好 IFTTT

const feedurl = 'https://rsshub.app/telegram/channel/BaccanoSoul/%23%E9%99%90%E5%85%8D%E6%9B%B4%E6%96%B0%E6%9D%BFiOS'
// rss 来源： https://docs.rsshub.app/

$axios(feedurl).then(res=>{
  const $ = $cheerio.load(res.data, {
    xml: {
      normalizeWhitespace: true,
      xmlMode: true,
    },
  })
  const pubDate = $('item pubDate').eq(0).text()
  console.log('last item publish date:', pubDate)
  const lastdate = new Date(pubDate).getTime()
  const laststore = $store.get('lastrss')
  if (laststore && laststore >= lastdate) {
    console.log('no new item')
    return
  }
  $store.put(lastdate, 'lastrss')
  const items = $('item')
  for (var i = 0; i < items.length; i++) {
    const itemdate = new Date($('pubDate', items[i]).text()).getTime()
    if (laststore && laststore >= itemdate) {
      return
    }
    const title = $('title', items[i]).text().split(' ¥')
    console.log('new item', title)
    const description = $('description', items[i]).text()
    const content = $cheerio.load(description)
    const link = content('a[href*=apple]').attr('href')
    $feed.ifttt(title[0], title[1], link)
    console.log(content.text())
  }
  console.log('all new item pushed')
}).catch(e=>console.error(e.stack))