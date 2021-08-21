// github 子目录文件下载
// 仅适用于 elecV2P
// Todo:
// [ ] 多文件同时下载（限制最大数

const config = {
  repos: $env.repos || 'elecV2/elecV2P-dei',     // github 仓库名。比如 elecV2/elecV2P
  folder: $env.folder || 'examples/JSTEST',      // 子目录。比如 script/JSFile
  dest: $env.dest || 'script/JSFile',            // 下载到此目录。
  options: {
    recursive: true,     // 是否下载 folder 下的子目录文件
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

  for (let file of tree) {
    if (file.type === 'file') {
      if (options.sizemax > 0 && file.size > options.sizemax) {
        console.log('skip download', file.name, 'file size:', file.size, 'is big than', options.sizemax)
        continue
      }
      if (options.onlyreg) {
        let reg = new RegExp(options.onlyreg)
        if (!reg.test(file.name)) {
          console.log('skip download', file.name, 'for onlyreg', reg)
          continue
        }
      }
      if (options.skipreg) {
        let reg = new RegExp(options.skipreg)
        if (reg.test(file.name)) {
          console.log('skip download', file.name, 'for skipreg', reg)
          continue
        }
      }

      try {
        await $download(file['download_url'], {
          folder: dest,
          name: file.name
        }, (d) => {
          if (d.progress) {
            console.log(d.progress + '\r')
          } else {
            console.log(file.name, '下载完成')
          }
        }).then(d=>console.log('文件已下载至:', d))
      } catch(e) {
        console.error(e.message || e)
      }
    } else {
      if (options.recursive) {
        await main(await getTree(file.url), dest + '/' + file.name, options)
      }
    }
  }

  console.log('文件已下载至', dest)
}