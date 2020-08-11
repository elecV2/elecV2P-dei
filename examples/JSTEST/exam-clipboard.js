$exec('powershell -command "Get-Clipboard | echo"', {
  cb(data, error){
    error ? console.error(error) : console.log(data)
  }
})