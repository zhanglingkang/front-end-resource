
console.log(process.versions);//0.8.8的node
console.log('This processor architecture is ' + process.arch);
console.log('This platform is ' + process.platform);
process.nextTick(function() {//用来隔绝异常，setTimeout也可以
  console.log('nextTick callback');
});
process.stdout.write("start reading" + '\n');
process.stdin.resume();//从标准输入流中读东西
process.stdin.setEncoding('utf8');
process.stdin.on("data",function(eachData){
	process.stdout.write("data:" + eachData + '\n');
})

// process.on('SIGINT', function() {//捕获杀死进程那 ctrl+c
//   console.log('Got SIGINT.  Press Control-D to exit.');
// });