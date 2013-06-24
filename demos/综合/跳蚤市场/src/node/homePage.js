var express = require("express"),
	app = express(),
	jade = require('jade'),
	connection = require('./service/connect').getConnect(),
	prodService  = require('./service/productService'),
	UPLOADIMG_PATH = __dirname + '/uploadImg',
	allProdData;


console.log("server start!");

app.configure(function(){
	app.set('views', __dirname + '/view'); //设置模板路径，比如index.jade
  	app.set('view engine', 'jade');  //配置模板解析引擎
 	app.use(express.limit('10mb'));    //限制用户提交内容的大小，防止DOS攻击
 	app.use(express.bodyParser({
 		keepExtensions: true, //后缀名开启
 		uploadDir: UPLOADIMG_PATH
 	}));    //将client提交过来的post请求放入request.body中
	app.use(express.methodOverride()); //伪装PUT,DELETE请求
	
	//静态服务器
	/* app.use(express.static(__dirname + '/js'));
		 app.use(express.static('js'));//it don't worked！！！*/
	app.use("/js", express.static(__dirname + '/js'));//it worked！！！
	app.use("/css", express.static(__dirname + '/css'));//需要缓存时，可加第二个参数{maxAge: 86400000}
	app.use("/uploadImg", express.static(UPLOADIMG_PATH));//用来放用户上传的文件名
	console.log("config ok!");
});
app.listen(3001);
app.get("/homePage",function(req,res){
	console.log("enter homePage");
	if(req.query.search){
		//获得满足关键字的所有数据
		prodService.getProdByWord(connection,req.query.search,function (prods) {
			res.render('homePage.jade',
			{
				'prodDataStr':JSON.stringify(prods),//将json给scirpt的变量的内容的变通之法
				'prodData': prods,
				'isSave':''
			});	 
		});
	}else{
		// 获得所有数据
		prodService.getAllProd(connection,function (prods) {
			res.render('homePage.jade',
			{
				'prodDataStr':JSON.stringify(prods),//将json给scirpt的变量的内容的变通之法
				'prodData': prods,
				'isSave':req.query.isSave
			});	 
		});
	}
	
	
});
app.post('/publishProd',function (req,res) {
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
	if(canSave){
		if(product.productImgUrl){
			product.imgSrc = product.productImgUrl;
		}else if(req.files.productImgFile && product.productImgFile){
			filePath = req.files.productImgFile.path;
			product.imgSrc = "/uploadImg/" + filePath.split("\\")[filePath.split("\\").length -1];
		}else{
			console.log("无图片");
		}
		product.updateTime = new Date();
		delete product.productImgFile;
		delete product.productImgUrl;
		delete product.picType;
		delete product.contractType;
		prodService.addProd(connection,product,function (isSave,err) {
			if(!isSave){
				console.log(err);
				res.redirect('/homePage?isSave=false');
			}
			res.redirect('/homePage?isSave=true');
		});

	}else{
		res.redirect('/homePage?isSave=false');
	}
	 

	
});