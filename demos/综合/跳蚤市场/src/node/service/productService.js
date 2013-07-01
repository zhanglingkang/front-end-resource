var util = require("../service/util"),
	filterSQLInjection = util.filterSQLInjection;
//https://npmjs.org/package/mysql
function getProd (connection,sql,callback) {
	connection.query(sql,function(err, prodData) {
		var data = {},
			hasData = false;
		if(err){
			console.log(err);
			callback && callback(null);
			return;
		}else{
			prodData.forEach(function(eachProd) {
				data[eachProd.prodId] = eachProd;
				hasData = true;
			});
			if(!hasData){
				data = null;
			}
			callback && callback(data);
		}
		
	});
}
function getAllProd (connection,callback) {
	var sql = 'SELECT * FROM productinfo';
	getProd (connection,sql,callback)
};

function getProdByWord(connection,word,callback) {
	word = filterSQLInjection(word);//防止sql注入
	word = util.replaceComonStrInLike(word);
	var sql = 'SELECT * FROM productinfo where searchStr like \'%' + word + '%\'';
	getProd (connection,sql,callback);
	console.log(sql);
// 	SELECT *
// 	FROM
// 	productinfo
// where name like '%4' union SELECT * FROM productinfo;#%'

};
//从产品中找关键字
function isTarProd (prod,word) {
	var searchRange = ['name','label','discribe'];
	for(var key in prod){
		if(searchRange.indexOf(key) > -1){
			if(prod[key].indexOf(word) > -1){
				return true;
			}
		}		
	}
	return false;
};
function addProd (connection,prod,callback) {
	connection.query("INSERT INTO productinfo SET ?",prod,function(err) {
		if(err){
			callback && callback(false,err);
			return;
		}else{
			callback && callback(true);
		}
	});
};


function updateProd (connection) {
};


exports.getAllProd = getAllProd;
exports.getProdByWord = getProdByWord;
exports.addProd = addProd;
