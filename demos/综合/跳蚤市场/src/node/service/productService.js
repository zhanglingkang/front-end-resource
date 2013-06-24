function getAllProd (connection,callback) {
	connection.query("SELECT * FROM productinfo",function(err, prodData) {
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
};

function getProdByWord(connection,word,callback) {
	getAllProd (connection,function (prodData) {
		var tarData = {},
			hasData = false;
		if(prodData){
			for(var key in prodData){
				if(isTarProd(prodData[key],word)){
					tarData[prodData[key].prodId] = prodData[key];
					hasData = true;
				}
			}
			if(!hasData){
				tarData = null;
			}
			callback(tarData);
		}else{
			callback(null);
		}
		
		
		
	});
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
