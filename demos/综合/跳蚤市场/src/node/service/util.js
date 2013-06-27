var _ = require("underscore");
//过滤用户输入的有害字符
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


exports.filterInput = filterInput;
exports.filterObj = filterObj;
