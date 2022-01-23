### minishell 子进程交互

init subprocess list

前提：每条 command 起一个 id

send('shell', {
	id,
	type: 'main|sub',
	data: 'command',
})

子进程为一系列，透明背景，划过可输入背景提醒

commandId = this.$wsrecv.id _ from _ order

subprocess {
	commandId: {
  	command: python3 te.py
	  history: {
      current: -1,
      lists:[]
    }
	}
}

childexec.on('exit', subprocess commandId remove)

### exec 所有进程统计

- from + id