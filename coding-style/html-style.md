# html代码风格
## <a name='TOC'>目录</a>
1. [Doctype](#doctype)
1. [编码](#charset)
1. [样式表文件](#css)
1. [脚本文件](#js)
1. [布尔值属性](#bool-attr)
1. [url](#url)
1. [其他](#other)
1. [参考](#reference)

## <a name='doctype'>Doctype</a>
使用`html5`的
```
<!DOCTYPE html>
```

## <a name='charset'>编码</a>
`<head>`的第一行放页面的编码
```
<meta charset="utf-8">
```
[返回顶部](#TOC)

## <a name='css'>样式表文件</a>
* 非特殊情况下样式文件必须外链至`<head>`。
* 引入样式表文件时, 须略去默认类型声明，如
```
<link rel="stylesheet" href="">
```
[返回顶部](#TOC)

## <a name='js'>脚本文件</a>
* 非特殊情况下脚本文件必须外链至页面底部
* 引入脚本文件时, 须略去默认类型声明，如
```
<script scr=""></script>
```
[返回顶部](#TOC)


## <a name='bool-attr'>布尔值属性</a>
有些属性不需要被设置，如 `disabled`,`checked`。因此，不要设置它。即使要设置也要符合[规范](http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#boolean-attributes)。如

```
<input type="text" disabled>

<input type="checkbox" value="1" checked>

<select>
  <option value="1" selected>1</option>
</select>
```
[返回顶部](#TOC)

## <a name='url'>url</a>
* 省略协议。使用`<script src="//xxx"></script>`而不也`<script src="http://xxx"></script>`
* 在域名末尾加`/` 原因见 http://www.douban.com/note/214496506/    
[返回顶部](#TOC)

## <a name='other'>其他</a>
* 重要图片必须加上alt属性; 给重要的元素和截断的元素加上title
* 元素属性使用双引号
* html的元素，属性，值，css选择器，选择器的属性和值使用小写字母    
[返回顶部](#TOC)

## <a name='reference'>参考</a>
* [github templates guide](https://github.com/styleguide/templates)
* [google htmlcssguide](http://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml)
* http://www.zhihu.com/question/19963993    
[返回顶部](#TOC)
