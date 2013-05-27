//(function () {
//    var ajaxSetBox = fish.one("#leftulcontent"); //内容框
//    var dpurl = "pageData.ashx";  //异步请求地址
//    var dpData = "";  //异步参数
//
//    fish.require("mPage", function () {
//        fish.all("#pageNum_title").mPage({
//            //url: dpurl + "?" + dpData, //异步地址加参数
//            url: "pageDemo.ashx", /* 暂时用这个 有了参数用上面的url*/
//            //ajaxType: "json",   //请求数据类型
//            //startWithAjax: true,  //一开始是否错发异步分页
//            args: {
//                pageNO: "pagenum"
//            },
//            callback: function (data, num) {  // 异步回调函数
//                //this.build(data.totalSize);
//                //ajaxSetBox.html("");
//                //var ajhtml = data.split("$$")[0];// 定义新内容的html
//                //ajaxSetBox.html(); //换内容
//                //syg_ajax();
//            }
//        });
//
//    })
//})(); 
// 邮件  定制周刊
(function () {
    var mfMan = {
        express: {
    },
    init: function (selectors) {
        this.express.eml = fish.all(selectors.eml);
        this.express.tip = fish.all(selectors.tip);
        this.express.btnmf = fish.all(selectors.btnmf);
        this.express.waiting = fish.all(selectors.waiting);
        this.express.success = fish.all(selectors.success);
    },
    //rule: /^\w[-.\w]*\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]{2,3}$/,
    process: function (selectors) {

        fish.one(document).on("click", function (e) {
            var tar = fish.getTarget(e);
            if (tar && tar.id == "btn_mf") {
                return;
            }


            if (tar && tar.id == "cn_eml_error_id") {
                mfMan.express.tip.removeClass('none');
            }
            else {
                mfMan.express.tip.addClass('none');
            }
        })


        var focused = false;
        this.init(selectors);
        mfMan.express.eml.on(
			'focus',
			function () {
			    if (focused !== true) {
			        this.value = '';
			        mfMan.express.eml.removeClass('gray_it');
			        focused = true;
			    }
			    mfMan.express.tip.addClass('none');
			}
		);
        mfMan.express.eml.on(
			'blur',
			function () {
			    //if (!fish.valida.email(this.value)) {
			    mfMan.express.tip.addClass('none');
			    //}
			}
		);
        mfMan.express.btnmf.hover(function () {
            mfMan.express.btnmf.addClass("email_btn_hover");
        }, function () {
            mfMan.express.btnmf.removeClass("email_btn_hover");
        });
        mfMan.express.btnmf.on(
			'click',
			function (e) {
			    fish.preventDefault(e);
			    if (!fish.valida.email(mfMan.express.eml[0].value)) {
			        mfMan.express.tip.removeClass('none');
			    } else {
			        fish.all('#id_rmf').addClass('none');
			        fish.all('#wait_mf_id').removeClass('none');
			        var ch = fish.all('#id_rmf .ci');
			        var str = '';
			        for (var i = 0, l = ch.length; i < l; ) {
			            if (ch[i].checked === true) {
			                str += ch[i].value + ',';
			            }
			            i++;
			        }
			        fish.ajax({
			            url: "/AjaxHelper/EmailSubscriptionAjax.aspx",
			            data: "pagename=index&email=" + mfMan.express.eml[0].value + "&interestinfos=" + encodeURI(str),
			            fn: function (data) {
			                if (data === "1") {
			                    fish.all('#wait_mf_id').addClass('none');
			                    fish.all('#mf_suc_id').removeClass('none');
			                } else if (data === "3") {
			                    fish.all('#wait_mf_id').addClass('none');
			                    fish.all('#id_rmf').removeClass('none');
			                }
			            }
			        });
			    }
			}
		);
    }
}
mfMan.process({
    eml: '#eml',
    tip: '#cn_eml_error_id',
    btnmf: '#btn_mf',
    waiting: '#wait_mf_id',
    success: '#mf_suc_id'
});
})();  
