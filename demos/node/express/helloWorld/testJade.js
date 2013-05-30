var express = require("express");
var app = express();
// http://naltatis.github.io/jade-syntax-docs/
app.get("/*",function(req,res){
	//默认 去 views文件夹下找  index.jade,根据后缀来确定用
	//app.set('views', __dirname + '/views'); //视图文件目录
	res.render("index.jade",{pageTitle:'Jade Example',layout:false});
});
app.listen(3001);
console.log("listen port 3001");