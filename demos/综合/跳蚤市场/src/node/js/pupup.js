(function ($) {
	var defParam = {
		pupupElem:undefined,//必须
		show:false,
		maskOpacity:0.7,
		ajax:false //弹出的内容是否是异步的
	},
	jMask,
	jWin = $(window),
	jBody = $("body"),
	jDoc =$(document),
	pupupWinArr = [];
	// 弹出层的显隐
	jDoc.click(function(evt) {
		var jTar = $(evt.target),
			shouldHide = true,
			isFind = false;
		pupupWinArr.forEach(function (each) {
			if(!isFind){
				each.jCtrlBtn.each(function () {
					if(jTar[0] == this || $(this).find(jTar).length > 0){
						shouldHide = false;
						return;
					}
				});
				if(shouldHide){
					if(jTar[0] == each.jPupupElem[0] || each.jPupupElem.find(jTar).length > 0){
						shouldHide = false;
					}
				}
			}
			
			if(!shouldHide){
				isFind = true;
			}
		});
		
		if(shouldHide){
			closeAll();
		}
	});
	function PopupWin (param,ctrlBtn) {
		var jCtrlBtn = $(ctrlBtn);
		this.param = $.extend({},defParam,param);
		checkParam(this.param);
		this.jPupupElem = $(param.pupupElem);
		this.jCtrlBtn = jCtrlBtn;
		this.init();
	};
	PopupWin.prototype.init = function(){
		var self = this;
		//控制弹出窗口的元素
		this.jCtrlBtn.each(function () {
			var jThis = $(this);
			jThis.click(function(){
				self.open();
			});
		});
		
		if(this.param.show){
			this.open();
		}
	};
	PopupWin.prototype.open = function(){
		closeAll(this);//关闭其他的
		var showInfo = this.getPupupShowInfo();
		jMask || makeMask(this.param);//mask 是公用的
		jMask.css({display:"block",top:jWin.scrollTop()}); 
		this.jPupupElem.css({
			position:"absolute",
			display:"block",
			visibility:"visible",
			"z-index":101,
			top:showInfo.top,
			left:showInfo.left
		}); 
		jBody.css({"overflow-y":"hidden"});
	};
	PopupWin.prototype.close = function(){
		if(pupupWinArr.length > 0){//没有弹出层就没必要进行关闭操作
			jMask && jMask.css({display:"none"}); 
			this.jPupupElem.css({display:"none"});
			jBody.css({"overflow-y":"auto"});
		}
		
	};
	PopupWin.prototype.closeAll = closeAll;
	PopupWin.prototype.getPupupShowInfo = function () {
		var pupupW,
			pupupH,
			winW = jWin.width(),
			winH = winheight(),
			top,
			left;
		this.jPupupElem.css({
			display:"block",
			visibility:"hidden"
		});
		pupupW = this.jPupupElem.width();
		pupupH = this.jPupupElem.height();
		top = Math.max(winH-pupupH,0)/2+jWin.scrollTop();
		left = (winW - pupupW)/2;
		return {
			top:top,
			left:left
		}
	}
	function makeMask (param) {
		jMask = $("<div></div>");
		jMask.css({
			position:"absolute",
			"z-index":100,
			display:"none",
			height:"100%",
			width:"100%",
			background:"#000",
			opacity:param.maskOpacity,
			filter:"filter: alpha(opacity ="+ param.maskOpacity+")"
		});
		$("body").append(jMask);
		
	}
	function checkParam(param){
		if(!param.pupupElem){
			throw "PopupWin param error:pupupElem is necessery"
		}else if($(param.pupupElem).length == 0){
			throw "PopupWin param error:pupupElem should be a dom elem or jQuery elem"
		}
	};
	function closeAll(except) {
		//关闭其他的
		pupupWinArr.forEach(function (each) {
			if(!except || except != each){
				each.close();
			}
			
		});
	}
	// Get the window height using innerHeight when available to avoid an issue with iOS
	// http://bugs.jquery.com/ticket/6724
	function winheight() {
		return window.innerHeight ? window.innerHeight : $(window).height();
	};

	$.fn.extend({ 
	  popup: function(param) { 
	  	var pupupWin = new PopupWin(param,this);
	  	pupupWinArr.push(pupupWin);    
	  	return pupupWin;
	  }   
	});
})(jQuery);