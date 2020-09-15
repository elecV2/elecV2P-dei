; 功能：
;   使用 win + j 快捷键快速执行选择代码或远程 JS
; 使用： (提前安装好 autohotkey)
;   1. 修改 webhook url 和 token 为 elecV2P 实际运行值
;   2. 通过 autohotkey 运行该脚本
;   3. 选择一段 JS 代码（比如：console.log("a autokey test");$result="hello ahk"），然后按 win+j。 相关代码会上传到 elecV2P 并执行，并返回相关结果。
;   -. 也可以选择一个远程 JS 链接（比如：https://raw.githubusercontent.com/elecV2/elecV2P/master/script/JSFile/webhook.js），然后按 win+j。 elecV2P 会自动执行远程 JS，并返回相关结果

#j::
webhook := "http://127.0.0.1/webhook"        ; or https://remote.xxxx.com/webhook
token   := "a8c259b2-67fe-4c64-8700-7bfdf1f55cb3"

Send, ^c        ; 复制选择内容
if clipboard = ""
  return
clipboard := RegExReplace(clipboard, """", "\""")
clipboard := RegExReplace(clipboard, "`r`n|`r|`n", "\n")
if (RegExMatch(url, "^http")){
  body = {"token":"%token%", "type":"runjs", "fn":"%clipboard%"}
} else {
  body = {"token":"%token%", "type":"runjs", "rawcode":"%clipboard%"}
}
req(webhook, "POST", body)
Return

Req(url, method, body) {
  WinHTTP := ComObjCreate("WinHTTP.WinHttpRequest.5.1")
  ;~ WinHTTP.SetProxy(0)
  ; MsgBox % body
  WinHTTP.Open(method, url)
  WinHTTP.SetRequestHeader("Content-Type", "application/json;charset=utf-8")
  WinHTTP.Send(body)
  Result := WinHTTP.ResponseText
  Status := WinHTTP.Status

  msgbox % "status: " status "`n`nresult: " result
}