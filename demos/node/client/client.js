// var http = require("http"),
// 	opts = {
// 		host:"www.baidu.com",
// 		port:80,
// 		path:"/",
// 		method:"GET"
// 	};
// var req = http.request(opts,function(res){
// 	console.log(res);
// 	res.on("data",function(data){
// 		console.log(data);
// 	});
// });
var http = require("http"),
	opts = {
		host:"www.baidu.com",
		port:80,
		path:"/"
	};
var req = http.get(opts,function(res){//用requst那api好慢，get很快
	// console.log(res);
	res.setEncoding('utf-8');//不设置的话，返回的是裸数据，2进制的
	res.on("data",function(data){
		console.log(data);//整个html
	});
});