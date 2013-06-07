var URL = require("url"),
	QueryString = require("querystring"),
	tarUrl = "http://www.nodejs.org/some/url/?with=query&param=that&are=awesome#alsohash",
	encodeUrl = QueryString.escape(tarUrl),
	parseUrlObj;
parseUrlObj =URL.parse(tarUrl);
console.log(parseUrlObj);
console.log("--------------------");
parseUrlObj =URL.parse(tarUrl,true);//true 的话，把query变成对象
console.log(parseUrlObj);
console.log("--------------------");
console.log(QueryString.parse('a=1&b=2&c=4'));//一个对象
console.log(QueryString.stringify({foo: 'bar', baz: 'qux'}, ';', ':'));
console.log(encodeUrl);
console.log(QueryString.unescape(encodeUrl));
