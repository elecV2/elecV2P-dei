```
最近更新: 2022-09-03 09:20
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/dev_note/service%20workers%20开发与优化.md
```

### 缓存策略 cache strategies

0. cache first, fetch fallback

优先使用缓存，缓存不存在则发送网络请求 fetch。

适用于图片等长期不更新的静态资源。

1. cache first, fetch synchronize

优先使用缓存，同时发送网络请求更新缓存数据。

适用于更新较频繁，但前端并不一定要求最新的资源。比如一些广告数据。

2. fetch first, cache fallback

优先使用网络请求，请求失败后使用缓存替换。

适用于要求最新资源，但失败后可使用缓存替换的内容。

3. cache first, random/schedule fetch update

优先使用缓存，随机或者间断固定时间后更新

其他：

- cache only/fetch only 没必要
- 请求直接返回，不经过 service worker (strategy -1)

### 资源匹配 what to cache

匹配方式：
- url
- path
- host
- mode
- search
- destination

为提高匹配效率，尽量使用全等匹配(includes)，不要使用正则(new RegExp().test())

``` JS
const CACHE_URL = new Map([['url', 1]])

let strategy = -1

// 匹配顺序待研究
switch (true) {
case CACHE_URL.has(request.url):
  strategy = CACHE_URL.get(request.url);
  break;
case CACHE_PATH.has(request.pathname):
  strategy = CACHE_PATH.get(request.pathname);
  break;
}
```

匹配顺序逻辑：按资源精确程度。

比如完整的 url 匹配精确度最高，放在最前面。

接下来是应该是 url 中的 search 部分，然后是 path 部分，然后是 host 部分，然后是 资源类型(destination)，然后是访问模式(mode)。

这是大概是匹配顺序，但应该根据实际项目进行调整。

### 关于 preload

仅在 event.request.mode === 'navigate' 的情况下发生

### 参考资料

https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
https://developer.chrome.com/docs/workbox/
https://googlechrome.github.io/samples/service-worker/basic/
https://web.dev/service-worker-lifecycle/