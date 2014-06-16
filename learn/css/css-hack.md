color:red; /* 所有浏览器都支持 */    
color:red !important;/* 除IE6外 */    
_color:red; /* IE6支持 */    
*color:red; /* IE6、IE7支持 */    
+color:red;/*IE7支持*/    
*+color:red; /* IE7支持 */    
color:red\9; /* IE6、IE7、IE8、IE9支持 */    
color:red\0; /* IE8、IE9支持 */    
color:red\9\0;/*IE9支持*/    
****

## 选择器hack    
*:lang(zh) select {font:12px !important;} /*FF,OP可见*/    
select:empty {font:12px !important;} /*safari可见*/    

仅IE7识别    
*+html {…}    
当面临需要只针对IE7做样式的时候就可以采用这个HACK。    

IE6及IE6以下识别    
\* html {…}    

/* webkit and opera */

@media all and (min-width: 0px){ div{color:red;} }    

/* webkit */
@media screen and (-webkit-min-device-pixel-ratio:0){ div{color:red;} }    

/* opera */
@media all and (-webkit-min-device-pixel-ratio:10000), not all and (-webkit-min-device-pixel-
ratio:0) { div{color:red;} }        

/* firefox * /    
@-moz-document url-prefix(){ div{color:red;}} /* all firefox */    

html>/**/body div, x:-moz-any-link, x:default {color:red;} /* newest firefox */    

body:nth-of-type(1) p{color:red;} /* Chrome、Safari支持 */    
<!--[if lt IE 7 ]> <html class="ie6"> <![endif]-->    
<!--[if IE 7 ]> <html class="ie7"> <![endif]-->    
<!--[if IE 8 ]> <html class="ie8"> <![endif]-->    
<!--[if IE 9 ]> <html class="ie9"> <![endif]-->    
<!--[if (gt IE 9)|!(IE)]><!--> <html> <!--<![endif]-->    
<!–[if IE 7]> = 等于 IE7    
<!–[if lt IE 8]> = 小于 IE8（就是 IE7 或以下了啦）    
<!–[if gte IE 8]> = 大于或等于 IE8    
<meta http-equiv="x-ua-compatible" content="ie=7" />     
把这段代码放到<head>里面，在ie8里面的页面解析起来就跟ie7一模一样的了
