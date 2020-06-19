// @require fs
// @require path

console.log(path.join(__dirname))

@exec('ls', (a,b,c)=>console.log(b))