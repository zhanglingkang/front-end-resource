var express = require("express"),
	app = express(),
	prodController  = require('./controller/productController'),
	UPLOADIMG_PATH = __dirname + '/uploadImg';

console.log("server start!");

app.configure(function(){
	// (required by session())
	app.use(express.cookieParser('keyboard cat'));
	app.use(express.session());
	app.set('views', __dirname + '/view'); //设置模板路径，比如index.jade
  	app.set('view engine', 'jade');  //配置模板解析引擎
 	app.use(express.limit('10mb'));    //限制用户提交内容的大小，防止DOS攻击
 	app.use(express.bodyParser({
 		keepExtensions: true, //后缀名开启
 		uploadDir: UPLOADIMG_PATH
 	}));    //将client提交过来的post请求放入request.body中
	app.use(express.methodOverride()); //伪装PUT,DELETE请求
	
	//静态服务器
	/* app.use(express.static(__dirname + '/js'));it don't worked！！！*/
	app.use("/js", express.static(__dirname + '/js'));//it worked！！！
	app.use("/css", express.static(__dirname + '/css'));//需要缓存时，可加第二个参数{maxAge: 86400000}
	app.use("/uploadImg", express.static(UPLOADIMG_PATH));//用来放用户上传的文件名
	console.log("config ok!");
});
app.listen(3001);

//product
app.get("/homePage",prodController.getAllProd);
app.get("/searchProd",prodController.searchProd);
app.post('/publishProd',prodController.publishProd);

