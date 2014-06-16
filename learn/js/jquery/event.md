# 事件
## 绑定事件(`.on`)
给存在的元素绑事件
 ``` js
 $( "#dataTable tbody tr" ).on( "click", function() {
    alert( $( this ).text() );
 });
 ```

给不存在的元素绑定事件，用事件委托（.live已被废弃）
```
$( "#dataTable tbody" ).on( "click", "tr", function() {
  alert( $( this ).text() );
});
```