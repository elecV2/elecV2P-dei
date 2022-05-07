### 目的

常量只属于某个脚本，或者必须提供某个密码才能查看。

$store.put('value 原始', 'secret_key', {
  pass: 'owowogld',
  algo: 'ebuf',
})

$store.get('secret_key', {
  pass: 'owowogld',
  algo: 'ebuf',
})

### 算法基础

参考：https://elecv2.github.io/#算法研究之非对称加密的简单示例



### 未来计划

- 默认加密存储常量