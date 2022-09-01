```
最近更新: 2022-09-01 10:14
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/dev_note/service%20workers%20开发与优化.md
```

### 缓存策略 cache strategies

1. cache first, fetch fallback

优先使用缓存，缓存不存在则发送网络请求 fetch。

适用于图片等长期不更新的静态资源。

2. cache first, fetch update

优先使用缓存，同时发送网络请求更新缓存数据。

适用于更新较频繁，但前端并不一定要求最新的资源。比如一些广告数据。

3. fetch first, cache fallback

优先使用网络请求，请求失败后使用缓存替换。

适用于要求最新资源，但失败后可使用缓存替换的内容。

其他：cache only/fetch only 没必要

### 资源匹配 what to cache

``` JS

```

### 关于 preload

仅在 event.request.mode === 'navigate' 的情况下发生

### 参考资料

https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
https://developer.chrome.com/docs/workbox/
https://googlechrome.github.io/samples/service-worker/basic/