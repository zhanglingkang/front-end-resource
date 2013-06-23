var express = require("express"),
	app = express(),
	jade = require('jade');

console.log("server start!");


var data = {
			"1":
			{
				name:"咪兔公仔",
				imgSrc:"http://ww1.sinaimg.cn/small/c01ce6degw1e5tkf8fd6bj21kw16oqpg.jpg",
				label:"八成新,玩偶",
				describe:"漂亮的咪兔公仔，里面是棉花，手感很好",
				qq:570491525,
				ownerName:"Joel"
			}
			,
			"2":
			{
				name:"玄机盒",
				imgSrc:"http://ww2.sinaimg.cn/small/c01ce6degw1e5tkkbgpj1j21kw16oqnv.jpg",
				label:"八成新,玩具,藏秘密",
				describe:"外表看，只是普通的盒子，内部其实是可以打开的哦~即，所谓玄机",
				mobile:13812660377,
				ownerName:"Joel"
			},
			"3":
			{
				name:"国际象棋",
				imgSrc:"http://ww2.sinaimg.cn/small/c01ce6degw1e5tle86kcgj21kw16o7w6.jpg",
				label:"益智游戏",
				describe:"无",
				qq:570491525,
				ownerName:"Joel"
			},
			"4":
			{
				name:"手机套|Mp3套",
				imgSrc:"",
				label:"电子产品配件",
				describe:"橘色的套子，外面有绒毛",
				qq:570491525,
				ownerName:"Joel"
			}

	};
app.configure(function(){
	app.set('views', __dirname + '/view'); //设置模板路径，比如index.jade
  	app.set('view engine', 'jade');  //配置模板解析引擎
	//   app.use(express.bodyParser());    //将client提交过来的post请求放入request.body中
	//   app.use(express.methodOverride()); //伪装PUT,DELETE请求
	
	//静态服务器
	/* app.use(express.static(__dirname + '/js'));
		 app.use(express.static('js'));//it don't worked！！！*/
	app.use("/js", express.static(__dirname + '/js'));//it worked！！！
	app.use("/css", express.static(__dirname + '/css'));
});
app.listen(3001);
app.get("/homePage",function(req,res){
	console.log("enter homePage");
	res.render('homePage.jade',
		{
			'prodDataStr':JSON.stringify(data),//将json给scirpt的变量的内容的变通之法
			'prodData': data
		});	 
});