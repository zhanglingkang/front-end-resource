# 工具方法
## 拓展jQuery对象上的属性
jQuery.fn.extend( object )
``` js
$.fn.extend( {test:'testStr'})
$('div').test // 'testStr'
```
## 拓展属性
jQuery.extend( target [, object1 ] [, objectN ] )
 ``` js
 var a = {}
 $.extend( a,{a:'a'},{b:'b'})
 a // {a:'a',b:'b'}
 ```