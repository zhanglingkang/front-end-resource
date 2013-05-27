var express = require("express");
var app = express();//等效于 express.createServer();
app.get("/hello.txt",function(req,res){
	 res.send('Hello Express!');
	 res.send('i\'am joel~');
	 
});
app.listen(3000);
console.log("listen port 3000");