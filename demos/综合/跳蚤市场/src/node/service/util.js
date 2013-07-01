var _ = require("underscore");
//过滤用户输入的有害字符 防XSS攻击
function filterInput (str) {
	if(!str || typeof(str) !== "string"){
		return str;
	}else{
		//HTML 中有用的字符实体 http://www.w3school.com.cn/html/html_entities.asp
		str = str.replace(/&/g,"&amp;");
		str = str.replace(/</g,"&lt;");
		str = str.replace(/>/g,"&gt;");
		return str;
	}
};
function filterObj(obj,omit){
	var omitArr,
		len;
	if(omit && typeof(omit) === "string" ){
		omitArr = omit.split(",");
		len = omitArr.length;
	}else if(_.isArray(omit)){
		omitArr = omit;
		len = omitArr.length;
	}else{
		len = 0;
	}
	for(var key in obj){
		if(obj.hasOwnProperty(key)){
			if(!(len > 0 && omitArr.indexOf(key)>0)){
				obj[key] = filterInput(obj[key]);
			}
		}
	}
};
//防止sql注入
function filterSQLInjection (str) {
	var rHarm = /select|union|update|delete|exec|count|TURNCATE|'|"|=|;|>|</ig;
	if(!str || typeof(str) !== "string"){
		return "";
	}else{
		str = str.replace(rHarm,"");
	}
	return str;
}

//模糊匹配 like中的通配符的替代
function replaceComonStrInLike (str) {
	if(!str || typeof(str) !== "string"){
		return "";
	}else{
		str = str.replace(/\[/g,"[[]");
		str = str.replace(/%/g,"[%]");
		str = str.replace(/_/g,"[_]");
	}
	return str;
}



exports.filterInput = filterInput;
exports.filterObj = filterObj;
exports.filterSQLInjection = filterSQLInjection;
exports.replaceComonStrInLike = replaceComonStrInLike;
