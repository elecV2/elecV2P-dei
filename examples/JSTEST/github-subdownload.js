// github 子目录文件下载
// 仅适用于 elecV2P
// Todo:
// [x] 多文件同时下载（限制最大数

const config = {
  repos: $env.repos || 'elecV2/elecV2P-dei',     // github 仓库名。比如 elecV2/elecV2P
  folder: $env.folder || 'examples/JSTEST',      // 子目录。比如 script/JSFile
  dest: $env.dest || 'script/JSFile',            // 下载到此目录。
  options: {
    recursive: $env.recursive ?? true,    // 是否下载 folder 下的子目录文件
    onlyreg: $env.onlyreg || '',          // 只下载文件名满足该正则表达式的文件
    skipreg: $env.skipreg || '',          // 跳过下载文件名满足该正则表达式的文件
    sizemax: $env.sizemax || 0,           // 当文件大小超过此设置值时，不下载。0: 表示不限制
  }
}

getTree(`https://api.github.com/repos/${config.repos}/contents/${config.folder}`).then(tree=>{
  main(tree, config.dest, config.options)
}).catch(e=>console.error(e.message))

async function getTree(apigit) {
  try {
    console.log('start get', apigit, 'tree')
    return await $axios(apigit).then(res=>res.data)
  } catch(e) {
    console.error('get', apigit, 'error', e.message)
    return []
  }
}

async function main(tree, dest, options = { recursive: true, onlyreg: '', skipreg: '', sizemax: 0 }) {
  if (!(typeof tree === 'object' && tree.length > 0 && typeof dest === 'string')) {
    console.log('输入参数有误', tree, dest)
    return
  }
  const onlyreg = new RegExp(options.onlyreg), skipreg = new RegExp(options.skipreg)
  for (let file of tree) {
    if (file.type === 'file') {
      if (options.sizemax > 0 && file.size > options.sizemax) {
        console.log('skip download', file.name, 'file size:', file.size, 'is big than', options.sizemax)
        continue
      }
      if (options.onlyreg) {
        if (!onlyreg.test(file.name)) {
          console.log('skip download', file.name, 'for onlyreg', onlyreg)
          continue
        }
      }
      if (options.skipreg) {
        if (skipreg.test(file.name)) {
          console.log('skip download', file.name, 'for skipreg', skipreg)
          continue
        }
      }

      mulDownload(file['download_url'], dest, file.name)
    } else {
      if (options.recursive) {
        await main(await getTree(file.url), dest + '/' + file.name, options)
      } else {
        console.log(`不下载 ${file.name}, 类型：${file.type}`)
      }
    }
  }
}

// 简异版多线程下载
let count = 0, todownlist = [];
function mulDownload(url, dest, name) {
  if (count > 5) {
    todownlist.push([url, dest, name])
    return
  }
  count++
  console.log('当前下载文件数:', count, '等待下载数:', todownlist.length)
  $download(url, {
    folder: dest,
    name, existskip: true,
  }, (d) => {
    if (d.progress) {
      console.log(d.progress + '\x1b[F')
    }
  }).then(res=>{
    console.log(name, '下载结果', res)
  }).catch(e=>{
    console.error(name, '下载错误', e.message || e)
  }).finally(()=>{
    count--
    if (todownlist.length) {
      mulDownload(...todownlist.shift())
    } else if (count === 0) {
      console.log('所有文件下载完成（如有错误或漏下，可以重新运行一次脚本）')
    }
  })
}