var express = require("express");
var app = express();// express.createServer() 已经被废弃了。。。
app.get("/hello.txt",function(req,res){
	 res.send('Hello Express!');
	 res.send('i\'am joel~');
	 
});
app.listen(3000);
console.log("listen port 3000");