# JSDoc
JSDoc是一个从javascript文件中抽取注释，生成文档的工具。类似JavaDoc。

## 用法
## 最简单的的用法
`/** 描述 */`
如
```
/** This is a description of the foo function. */
function foo() {
}
```

## 使用标签
如果你想描述方法的参数，可以这样使用
```
/**
 * @param {string}somebody - Somebody's name
 */
function sayHello(somebody) {
    alert('Hello ' + somebody);
}
```
`somebody` 是参数名    
`{string}` 是参数的类型    
`Somebody's name` 参数的描述    

下面描述一些常用的标签
* 参数描述。用法: `@param {类型} 参数名 - 参数描述`
	* 如果参数名以`[]`来包围，表示这参数是可选的
	* `参数名=默认值`，表示参数的默认值
	* `{类型1|类型2}`，表示多个类型
* 方法的返回值。用法 : `@returns {类型} 返回值描述`
* 文件描述。用法 ： `@file 文件描述`

[更多](http://usejsdoc.org/tags-param.html)






所有标签见[这里](http://usejsdoc.org/#JSDoc3_Tag_Dictionary)
## 资源
* [官网](http://usejsdoc.org/)
* [jsdoc github](https://github.com/jsdoc3/jsdoc)
* [jsdoc Grunt 插件](https://github.com/krampstudio/grunt-jsdoc)

