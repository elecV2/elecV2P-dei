; 通过附带参数移动鼠标。 windows 平台使用，且已安装好 autohotkey
; 示例：
; mousemove.ahk left 400  ; 鼠标左移 400 Pixel
; mousemove.ahk click 300 400 4   ; 在屏幕 300，400 的位置点击鼠标 4 次

; MsgBox Parameter number %1%

if %1%
  direction = %1%
else
  direction := "left"

if %2%
  movestep = %2%
else
  movestep := 30

if (direction = "left")
  MouseMove, -movestep, 0, 0, R
else if (direction = "right")
  MouseMove, movestep, 0, 0, R
else if (direction = "up")
  MouseMove, 0, -movestep, 0, R
else if (direction = "down")
  MouseMove, 0, movestep, 0, R
else if (direction = "click")
  MouseClick, left, %2%, %3%, %4%