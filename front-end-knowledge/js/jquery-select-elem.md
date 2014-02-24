## 使用选择器选取元素
jquery支持使用大部分css3选择器来选元素，支持常用选择器如下
* 基本
    * \*所有元素
    * `#id`  id选择器
    * `.class`  class选择器
    * `tagName`  标签选择器：如$('div')
    * `selector1,selector2...`   将每一个选择器匹配到的元素合并后一起返回。
    * `query1qeury2...` 如 $('.a.b') 选取同时具有类名a和b的元素
* 层级
    * `ancestor descendant` 祖先元素下匹配所有的后代元素 其等效于 `$('ancestor').find('descendant')`
    * `parent > child`  父元素下匹配所有的子元素
    * `prev + next` 紧接在 prev 元素后的 next 元素
    * `prev ~ siblings` prev 元素之后的所有 siblings 元素
* 子元素

    * `parents :first-child`  返回所有parents的第一个元素,因此结果集可能是多个，等效于`:nth-child(1)` 如`$('ul li:first')` 选中所有ul下第一个li  
    * `parents :last-child` 最后一个元素
    * `:nth-child(index)`
* 属性选择器
    * `[attr]`
    * `[attr=value]`
    * `[attr!=value]`
    * `[attr^=value]`
    * `[attr$=value]`
    * `[attr*=value]`    
* 结果集中的部分元素
    * `:eq(index)`
    * `:gt(index)`
    * `:lt(index)`
    * `selector:first` 返回第一个符合selector的元素 `$('div:first')` 等效于 `$('div').eq(0)`
    * `selector:last`
    * `:odd`
    * `:even`
    * `:not`
* 表单
    * `:checked`
    * `:disabled`
    * `:enabled`
    * `:selected` 如 `$("select option:selected")`


## 选中集合中过滤元素
* `filter`

## 选中集合中添加元素
* `add`

## 找符合条件的父级
* `parent`
* `parents`
* `closest`



## 参考
* http://api.jquery.com/category/selectors/
* http://www.w3school.com.cn/jquery/jquery_ref_selectors.asp


