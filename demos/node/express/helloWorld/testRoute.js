var express = require("express");
var app = express();//等效于 express.createServer();
// 路由的规则是按顺序来的，只匹配第一个匹配到的。以此路由应该是路由规则具体的在前面，通用的在后面
app.get("/stu:id/_:courseId?",function(req,res){
	/*
	*url http://localhost:3001/stu33/_df    req.params:[id:33,courseId:df]
	*?:表示是那变量可选的 即该url可匹配 http://localhost:3001/stu34/_
	* /stu:id?_:courseId? 不能匹配 /stu34_341/sth:即不能匹配'/'
	*/
	console.log(req.params);
	 if(req.params.id != undefined){
		res.send("you have an id ^-^");
	 }else{
		res.send("oh,you do not have an id ^-^");
	 }
	 
});
app.get(/\/stu(\d+)/,function(req,res){
	var stuNum = parseInt(req.params[0],10);
	res.send("hi,stu"+stuNum);
	if(stuNum < 10){
		//next(); 走向下一个路由，但发现next not defined。。。
	}
});
// 字符串与正则的混合，正则用来验证，变量用来提取信息：如 '/:id(\\d+)'
app.get("/stu*",function(req,res){//*表示0个及以上的字符。
	res.send("hi,other student~");
});
app.get("*",function(req,res){
	console.log(req.headers);//请求头
	res.send("oh,shit,not Found",404);
});

app.listen(3001);
console.log("listen port 3001");