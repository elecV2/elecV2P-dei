const command = 'CHCP 65001'

$exec(command, {
  cb(data, error){
    error ? console.error(error) : console.log(data)
  }
})