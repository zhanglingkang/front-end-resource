var cheerio = require('cheerio');
var nodegrass = require('nodegrass');
var url = "http://tuan.baidu.com/";

// nodegrass 文档 http://www.cnblogs.com/vimsk/archive/2012/09/22/2697806.html
nodegrass.get(url,function(data,status,headers){
	console.log("load page succ");
	var res = [],
		$ = cheerio.load(data);
	$(".fcb").each(function (index,each) {
		var jThis = $(this),
			eachDes = jThis.html(),
			eachHref = jThis.attr("href");
		// console.log(jThis.html());
		if(eachDes.indexOf("电影") > -1){
			res.push(eachDes);
			res.push(eachHref);
		}
	});
    console.log(res.join("\n"));
},'gbk')//百度是gbk编码的，用utf8会乱码 目前Node.js不支持gbk，这里nodegrass内部引用了iconv-lite进行了处理
.on('error', function(e) {
 	console.log("Got error: " + e.message);
});