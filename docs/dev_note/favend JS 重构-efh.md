```
近期更新: 2021-12-09 22:10
```

### 原因

elecV2P favend 中的 JS 可能包含 html 部分，直接使用 JS 进行插入，不够优雅。主要是在写的时候，代码编译器默认是 JS 高亮模式，而 html 部分只能通过注释的方式编写，失去了高亮/补齐等特性。于是想可以通过类似 vue 或 react 的结构来设计此部分代码。

比如，html 部分使用 <template></template> 标签进行包裹，JS/api 返回部分使用 <script></script> 标签。当然具体重构的时候可以使用其他 elecV2P 专用标签，细节问题之后再考虑。该方式的主要问题是，此类 JS 文件是不能直接运行的，比如 .vue 文件需要转化才能执行。在 elecV2P 中这类类似 JS 的文件可以叫做，.euv/.evu/.evs/.ejs 等，同样此类细节问题之后再考虑，假如暂时命名为 .evs ，那么 evs 文件必须满足的一点是：可直接运行，至少是在 node 环境下可直接执行（因为 elecV2P 的 favend 本身就运行在 node 环境中）。

### 初步设计

如果按照 node 可运行的标准，其实 .vue 也可以（要不直接使用 vue？本篇完^\_^）。但是每次都使用 node 对 vue 文件进行转化，再返回，可能比较耗时和占用资源（没有具体测试过，耗时和资源占用，不过应该不大可行）。

按照最新的 ES6 module 标准，可以直接 import/export。（但这部分还没有仔细研究过 2021-09-20 15:02 ，得专门学习一下）。已知的是这种模式可以直接在浏览器中运行，不需要服务器提前编译。然后问题是：如何优雅的插入 html 代码（我们最初要解决的问题）。可直接 import html 文件吗？或者先载入 JS ，然后再载入 html？又或者直接将 html/css/js 打成一个包(module)，这个包就是 backend 之前对应的 "JS"。然后这个包是应该以**文件夹**的形式存在，还是**文件**的形式？比如 .evs。

也许可以是一个以 .evs 结尾的文件夹？那么这个文件夹应该怎么以 **module** 的形式发送给前端页面呢？.evs 包含 xx.json 配置文件，指定 html 入口文件，然后 html 文件引入 js/css？

想得太多，而知道的太少。先去看一下 module 前端打包的相关知识。2021-09-20 15:13

### 待解决问题 2021-09-30 09:24

- JS 或者说模块的生命周期

### 基本模型 2021-10-19 18:43

假设是一种部分化的 HTML 页面，比如 iframe，但比 iframe 更小，只能是一个 div，这些 div 是基本模块，里面包含自身所需 css/js，以及可与后台交互的 js，且可以请求其他 div 模块，并且可与已有的基础页面通信，以及和后来请求的 div 模块通信。

首先基础页面可包含一个通用的 css 文件，比如 ant-design-vue 的 css，这个 css 是所有子 div 共用。然后也可以包含一个共用的 js 函数库，类似于 methods。另外还得包含一个远程函数库 **backend**(之后再找个比较合适的名字)，里面包含的函数实际运行在后端，但在前台无感知。比如点击某个按钮，在后台移动/删除某个文件，但整个过程得让用户感觉和操作本地的数据一样。点击在前端执行 console.log(1)，点击在后台执行 console.log(1)，这两者在用户眼里并无区别（目标是这样的）。

一段伪代码：

``` JS
html: `
<button data-method='log' data-parm='1'>front 1<button>
<button data-method='log' data-type='backend' data-parm='2'>back 2<button>
`
methods: {
  log(data){
    console.log('front', data)
  }
}
backend: {
  log(data){
    console.log('back', data)
  }
}
```

问题:

html 编写仍然没有高亮部分（或许写个编辑器插件来解决？那么别人为什么要用你这个插件呢？进一步，别人为什么要用你这个 backend ？有什么优势？）

到底想实现的是一个什么样的东西？

其实我自己也不是太明白。很喜欢**云原生**这个概念，但这个概念好像都只是概念而已，看过一些所谓的云原生的产品，其实就是一台部署在云端的服务器或软件而已，好像和本地没有一点关联。
**小程序**把前端的很多部分都*本地化*了，但也产生了很多的屏障，每个平台搞一套语义标签一套 css一套 js 接口，在扩展/发扬 html(前端) 的同时，好像更像是在搞分裂。

**云原生概念** + **小程序概念** 可以搞出一个什么样的东西？
写程序不分前端和后台（像前面示例的点击运行 log 函数，不分是在前端运行还是后端运行），但这其实还是分前后台。更准备的说应该是不分前端开发和后端开发，开发，写一套程序同时可调用前端数据/函数和后台数据/函数。更进一步说，是写一段代码现时包含前端和后端部分，当需要使用前端相关功能时就使用前端部分，需要后台数据时，就使用后台部分。

那么，为什么要搞这么复杂呢？
其实在我看来这应该是变简单了。现在全栈开发好像有了一点点的趋势，但实际上的全栈其实就是打两份工而已。这边写后台代码，写完后又去写前端代码，这其实就这两个活是一个人干，还是两个人干的问题。那么这跟前面所说的又有什么有关系？

假如前端要向后台请求一个数据，很多时候，前端其实并不知道后台会返回什么样的数据，甚至可能是一个错误。这需要前后有效的沟通（这不是一件容易的事）。再看一段伪代码

``` JS
html: `
<button data-method='getUser'>GET user<button>
`
methods: {
  log(){
    let user = await fetchData('/username')
    alert(user)
  }
}
backend: {
  router('/username'){
    // maybe get name from some db
    // let data = db.get('userid')
    return 'elecV2P'
  }
}
```

主要目的：实现前后端代码的同时开发，真正的**全栈工程师**。

当然这种方式可能只适用于一些小的项目，但这就是原本的设计场景。一个小的 div 包含自身的 css/js，可与后台进行交互。

2021-10-19 19:33  未完待续

### elecV2P favend html(.efh) 2021-12-01 21:17

经过一段时间的思考，得到一个初步可能可行的方案（等优化完善。

以最初 html 页面为基础，增加标签 <script type="text/javascript" runon="elecV2P">此部分为后台代码(run on elecV2P)</script>

``` xml default.efh
<div>
  基础 html 部分
</div>
<script type="text/javascript">
  console.log('前端 JS')
  <!-- 从后台获取数据 同页面自定义 API -->
  fetch('?data=json').then(res=>res.json()).then(console.log)

  <!-- 假如引入 $fend(待完成) -->
  async function main() {
    let data = await $fend.get('json')
    console.log(data)
  }
</script>

<script type="text/javascript" runon="elecV2P">
  <!-- 可使用 src 属性引入本地或远程 JS -->
  console.log('后台 JS')

  if (JSON.parse($request.body).data === 'json')) {
    $done({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'X-Powered-By': 'elecV2P'
      },
      body: {
        'hello': 'elecV2P favend',
        'note': '这是由 elecV2P favend 返回的 JSON 数据',
        'docs': 'https://github.com/elecV2/elecV2P/blob/master/efss/readme.md',
        'request': $request
      }
    })
  } else {
    $done('get method ' + $request.method)
  }

  <!-- 假如引入 $fend(还没写) -->
  $fend.set('json', { hello: 'from elecV2P $fend' })
</script>
```

执行过程/基本原理:
- 首次执行 .efh 文件时，先使用 cheerio 模块将 efh 文件分离为**前端和后端**，并进行缓存
- 然后当使用 get 请求主页时，直接返回**前端**代码
- 当前端使用 fetch 或 $fend 请求后台 API/数据时，执行**后端**代码并返回执行结果


优点:
- 前后端代码同一页面，方便开发者进行管理
- 标签高亮（最初要解决的问题
- 沿用 html 语法，没有额外的学习成本

缺点:
- 需要一个后台“引擎”对代码进行分离（开发者不需考虑

待优化部分:
- 前端 fetch，后台 $request 判断，不够简单/优雅。可引入变量进行统一，比如 $fend, 使用 $fend.get('key') 获取，使用 $fend.set('key', 'data') 绑定赋值
- 长连接/持续数据传输，关闭后自动清理缓存

问题:
- 和最初的 PHP/PYHTON 等后台生成前端页面有什么区别？

这是在 html(前端) 插入后台运行的代码

#### efh 细节实现 2021-12-06 20:23

- $fend

前端：$fend(key/attr/arg/params<string>, data<string\|object>)<promise>
后台：$fend(key, data<any>)

简单说明：
- key 可以看成是一个路由，或者是要从后台获取的关键值/API 等，前后端应该配对出现。
- 前端 $fend 第二参数 data 表示要传输给后台的值，可省略。
- 后台 $fend 第二个参数为 key 对应的返回值，可以是一个函数。当为函数时，此函数接收的第一项参数为前端传输过来的 data。

使用示例：

``` JS
// 前端部分
$fend('newone').then(res=>res.text()).then(console.log);

$fend('skey', '传输给后台的数据').then(res=>res.text()).then(alert).catch(e=>console.error(e));

// 后台部分
$fend('newone', $store.get('newone'));

$fend('skey', d=>{
  console.log('收到前台传输数据:', d);

  return {
    ok: true,
    data: d,
    message: '后台返回数据，可以是 string 或 object'
  }
})
```

*通常情况建议只使用一对 $fend 来交互数据，使用第二个参数 data 来确定数据内容。*

底层实现：（这部分由平台开发者完成，在编写 efh 时直接使用上面的示例形式调用即可）

前端 $fend 为封装了 fetch 的函数，后台 $fend 在 context 中实现。

``` JS
// 前端部分
function $fend(key, data) {
  return fetch('', {
    method: 'post',
    body: JSON.stringify({
      key, data
    })
  })
}

// 后台部分
CONTEXT.final.$fend = async function (key, fn) {
  // 有 bind this, 勿改写为 arrow function
  if (typeof this.$request === 'undefined') {
    return this.$done('$request is expect');
  }

  let body = this.$request.body;
  if (!key || !body) {
    return this.$done('$fend key and body is expect');
  }
  try {
    body = JSON.parse(body);
  } catch(e) {
    return this.$done('a object string of $request.body is expect');
  }
  if (body.key === key) {
    if (typeof fn === 'function') {
      try {
        fn = await fn(body.data);
      } catch(e) {
        fn = '$fend ' + key + ' error: ' + e.message;
        console.error('$fend', key, 'error', e);
      }
    }
    return this.$done(fn);
  }
}.bind(CONTEXT.final);
```

待优化：

- 其他类型数据 arrayBuffer/stream 等
- $fend 后台无匹配时返回结果
- $fend key/路由 配对优化

### $fend.on('message', ()=>{}) 2022-07-31

接收服务器端发送的数据，基于 sse

*客户端服务器自动协商通信*（how?

``` JS
$fend.on = (event, fn)=>{

}
let ee = new EventSource('/sse/elecV2P/' + this.id)
```