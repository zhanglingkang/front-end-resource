var cheerio = require('cheerio');
var nodegrass = require('nodegrass');
var url = "http://vipbook.lcread.com/vipchapters/read?book=248618&volume=764831&chapter=5400851";


nodegrass.get(url,function(data,status,headers){
	console.log("load page succ");
	var res = [],
		$ = cheerio.load(data);
	if($("#pcd").length>0){
		console.log("登陆页。。。，failed");
	}
    
},'utf8')//百度是gbk编码的，用utf8会乱码 目前Node.js不支持gbk，这里nodegrass内部引用了iconv-lite进行了处理
.on('error', function(e) {
 	console.log("Got error: " + e.message);
});