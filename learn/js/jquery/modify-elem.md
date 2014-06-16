# 修改元素
## 替换自身
`.replaceWith`。如
```
  $('.tar').replaceWith('<div>repleceSth</div>')
```

##  <a name='remove'>移除</a>
### 移除元素
`.remove`

### 移除元素的子元素
`.empty`。`$('div').empty()`等同于 `$('div').children().remove()`

