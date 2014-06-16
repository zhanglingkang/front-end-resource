# 网站建设小贴士
## 图片
* 颜色丰富的背景图 用jpg
* 小图标一般用png-8，尽量不用png-24
* 图片psd保存时，要保存为 web所用格式
* 图片的大小尽量控制在200k以下


## flash
* flash的在页面拉伸时保持在页面中居中显示可以用：中间flash加背景图来实现，页面变窄时，裁切掉的是背景图的部分
      * 切背景图须知：
		1. flash的高度必须与背景图一样高（否则会出现到页面窄到一定程度时，flash与背景图错位）
		2. flash在背景图中也要水平居中
		3. 背景图与flash重合部分改成透明的，但其透明区域要比flash的宽度窄10px，来保证接合处没有黑边


### 关闭当前窗口 兼容 ie6+ ch ff
```js
window.opener=null;
window.open('','_self');
window.close();
```
**tip**    
* 只写window.close();ch中没反应    
* firefox浏览器默认脚本不能关闭当前窗口,必须要做以下设置    
    1. 在地址栏输入about:config然后回车，警告确认    
    2. 在过滤器中输入”dom.allow_scripts_to_close_windows“，双击即可将此值设为true   


***
### 常用特殊符号编码
\< 小于 &lt; &#60;    
\> 大于 &gt; &#62;    
& &符号 &amp; &#38;    
" 双引号 &quot; &#34;    
人民币符号 &yen;    
© 版权 &copy; &#169;    
® 注册商标 &reg; &#174;    
× 乘号 &times; &#215;    
÷ 除号 &divide; &#247;    

***
### css 字体Unicode 编码
宋体 \5B8B\4F53    
黑体\9ED1\4F53    
标楷体\6807\6977\4F53     
楷体 \6977\4F53    
万能的方式：firebug控制台中输入 escape(‘黑体’) 
得到了 “%u9ED1%u4F53″，将其改写为 “\9ED1\4F53″即可

***
### 标签的嵌套不符合标签的嵌套规则时，可能会导致浏览器的错误解析。
***
### ie中有input,a获得焦点会有虚线虚线框解决方式
> IE的私有属性可以有效的根除IE的链接虚框.在那元素上加   hidefocus="true" 属性
a:active{outline:none;}
 可以去除用户点击图片式链接时的外框线的问题，同时保留了习惯使用键盘用户在链接获得焦点时虚框可见。
:active还有一点小小的问题，就是用户点击一个链接和这个链接指向的页面加载的过程中，链接外框依旧会出现，这其实也不难理解，链接被点中， 也处于:focus状态。由于本测试页面的链接基本上都是在页面自身，所以看不到此问题。一定程度上解决此问题的方法就是添加:hover的 outline:none属性。
a:hover,a:active{outline:none;}

***
### 让iframe背景透明的方式
> iframe上加  allowTransparency="true"    
iframe中的body加  bgColor="transparent"    
用js
``` js 
$('iframe')[0].contentWindow.document.body.setAttribute('bgColor','transparent');
```
> 去除iframe的border    
加属性frameBorder="0" 用 css的border属性无效。

***
### css做箭头
``` css
width:0;
height:0;
font-size:0;
line-height:0;
border:4px solid transparent;
_border:4px solid #fff;/*#fff是背景色*/
  /*方向border-top-color:#666;*/ 

```
***





