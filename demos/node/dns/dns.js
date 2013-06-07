
var dns = require("dns");
	
dns.lookup("www.baidu.com",4,function(exp,ip){//ipv4 or ipv6 
	console.log(ip);
});

dns.resolve("www.baidu.com","A",function(e,ipArr){
	console.log(ipArr);
});