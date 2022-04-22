### 目的

常量只属于某个脚本，或者必须提供某个密码才能查看。

$store.put('value 原始', 'secret_key', {
  secret: 'owowogld',
})

$store.get('secret_key', {
  secret: 'owowogld',
})

### 未来计划

- 默认加密存储常量