var SAVE_SUC = 1,
	SAVE_FAI = 0,
	NOT_FROM_SAVEPAGE = 2,
	// jade = require('jade'),
	connection = require('../service/connect').getConnect(),
	prodService  = require('../service/productService'),
	util = require('../service/util'),
	filterObj = util.filterObj,
	allProdData;

function getAllProd(req,res){
	console.log("enter homePage");
	// 获得所有数据
	// var referer = req.get('referer');//从保存过来的，reffer竟然还是
	prodService.getAllProd(connection,function (prods) {
		var fromPublidPage = req.session.fromPublidPage,
			saveSucc = req.session.saveSucc;
		if(!fromPublidPage){
			saveSucc = NOT_FROM_SAVEPAGE;
		}
		req.session.saveSucc = NOT_FROM_SAVEPAGE;
		req.session.fromPublidPage = false;
		res.render('product.jade',
		{
			'prodDataStr':JSON.stringify(prods),//将json给scirpt的变量的内容的变通之法
			'prodData': prods,
			'saveSucc':saveSucc
		});	 
	});
}
//获得满足关键字的所有数据
function searchProd(req,res){
	var keyWrod = req.query.keyword;
	req.session.saveSucc = NOT_FROM_SAVEPAGE;
	prodService.getProdByWord(connection,keyWrod,function (prods) {
		res.render('product.jade',
		{
			'prodDataStr':JSON.stringify(prods),//将json给scirpt的变量的内容的变通之法
			'prodData': prods,
			'saveSucc':NOT_FROM_SAVEPAGE
		});	 
	});
};

function publishProd(req,res){
	var product = req.body,
		canSave = true,
		filePath;
	//对用户提交过来的东西进行验证
	if(product){
		if(!(product.name && product.describe && product.ownerName && product.contractType)){
			canSave = false;
		}
	}else{
		canSave = false;
	}
	req.session.fromPublidPage = true;
	if(canSave){
		if(product.productImgUrl){
			product.imgSrc = product.productImgUrl;
		}else if(req.files.productImgFile && req.files.productImgFile.size > 0){
			filePath = req.files.productImgFile.path;
			product.imgSrc = "/uploadImg/" + filePath.split("\\")[filePath.split("\\").length -1];
		}else{
			console.log("无图片");
		}
		product.updateTime = new Date();
		product.searchStr =  product.name + '|' + product.describe + '|' + product.label;
		filterObj(product);
		delete product.productImgFile;
		delete product.productImgUrl;
		delete product.picType;
		delete product.contractType;
		prodService.addProd(connection,product,function (isSave,err) {
			if(!isSave){
				console.log(err);
				req.session.saveSucc = SAVE_FAI;
				res.redirect('/homePage');
			}
			req.session.saveSucc = SAVE_SUC;
			res.redirect('/homePage');
		});

	}else{
		req.session.saveSucc = SAVE_FAI;
		res.redirect('/homePage');
	}
};

exports.getAllProd = getAllProd;
exports.searchProd = searchProd;
exports.publishProd = publishProd;