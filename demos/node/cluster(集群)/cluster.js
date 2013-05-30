var cluster = require("cluster"),
	http = require("http"),
	cpuNums = require('os').cpus().length;
console.log("你的服务器有"+ cpuNums + "核");//两核

if(cluster.isMaster){
	for( var i = 0;i<cpuNums;i++){//创造工作进程
		var worker = cluster.fork();
		worker.on("message",function(msg){
			console.log(msg.id + " : " + " use memory " + msg.memory);
		});
	}
	cluster.on("death",function(worker){
		console.log( "worker " + worker.id + " died");
		cluster.fork();
	});
}else{
	http.Server(function(req,res){
		res.writeHead(200);
		res.end("hi~");
	}).listen(9000);
	// 每秒报告状态
	var memoryUsage = process.memoryUsage().rss;
		processId = process.pid;
	setInterval(function (){
		process.send({memory:memoryUsage,id:processId});
	},5000);
}

