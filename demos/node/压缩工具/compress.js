var fs = require('fs'),
	fileNames,
	shouldCompressFileNames = [],
	compressedFileNames=[],
	shouldCompressFileNameReg = /(.+)\.fwd\.js/,
	compressBat = "compiler_js.bat",
	tempPrefix = "@echo off \n",
	tempMiddle = "java -jar compiler.jar --js {source} --js_output_file {min} --charset utf-8 \n",
	tempPostfix = "Pause",
	eachCommand = "",
	res = [];
/*1，读某个路径下 所有的 文件名带 fwd的，读文件名，
2，读cmd文件,替换 文件名和 不带fwd的
3，执行cmd */
console.log("startReading...");
fileNames =  fs.readdirSync(".");//当前路径
fileNames.forEach(function(eachFileName){
	var eachMatch;
	if(shouldCompressFileNameReg.test(eachFileName)){
		shouldCompressFileNames.push(eachFileName);
		eachMatch = shouldCompressFileNameReg.exec(eachFileName);
		compressedFileNames.push(eachMatch[1]+".js");
	}
});
res.push(tempPrefix);
shouldCompressFileNames.forEach(function(eachFileName,i){
	eachCommand = tempMiddle;
	eachCommand = eachCommand.replace("{source}",eachFileName);
	eachCommand = eachCommand.replace("{min}",compressedFileNames[i]);
	res.push(eachCommand);
});
res.push(tempPostfix);
console.log(res.join(""));
if(shouldCompressFileNames.length>0){
	fs.writeFile(compressBat, res.join(""), function (err) {
		if (err) throw err;
		console.log('It\'s saved!');
	});
	
}
//调用批处理文件
var run = require('child_process');
run.exec("start " + compressBat, function( e, stdout, stderr ){  
	//console.log( "...");  
    if( e ){  
        console.log( e );  
    }else{
		console.log("success");
	}

});
console.log(shouldCompressFileNames);
console.log(compressedFileNames);
