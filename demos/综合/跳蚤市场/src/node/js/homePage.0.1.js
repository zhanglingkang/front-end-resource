(function ($) {
	$(function(){
		init();
	});
	function init(){
		if($.browser.msie){
			$(".exploreTip").removeClass("none");
		}
		initPublishNewProd();
		initAboutUs();
		initShowDetail();
		searchProd();
	};
	//发布宝贝
	function initPublishNewProd() {
		var jPublishProdHref = $(".publishProdHref"),
			jPublishProdDetail = $("#publishProd"),
			jPublishProdWin,
			jClosePublishProd = $(".closeBtn",jPublishProdDetail),
			jAllNeceInputWrap = $(".necessIcon").parents("dl"),
			jContractWrap = $(".contractWrap"),
			jContractItemWrap = $(".item",jContractWrap),
			jPublishProdBtn = $("#publishProdBtn"),
			jMobileInput = $(".mobileInput");
			
		//弹出框
		jPublishProdWin = jPublishProdHref.popup({
			pupupElem:jPublishProdDetail
		});
		jClosePublishProd.click(function () {
			jPublishProdWin.close();
		});
		//验证
		jPublishProdBtn.click(function  (evt) {
			evt.preventDefault();
			var canSumbit = true,
				jError;
			// 非空
			jAllNeceInputWrap.each(function  () {
				var jThis = $(this),
					jInput = $("input[type=text],textarea",jThis),
					jError = $(".errMsg",jThis),
					jLabel;
				//对于联系方式那特殊处理
				if(jInput.length == 1 && $.trim(jInput.val()) == ""){
					jLabel = $("label",jThis);
					jError.html(jLabel.html() + "不能为空");
					jError.removeClass("none");
					canSumbit = false;
					return false;
				}else{
					jError.addClass("none");
				}
			});
			if(canSumbit){
				//联系方式
				jError = $(".errMsg",jContractWrap);

				if(jContractWrap.find(":checked").length == 0){
					jError.html("必须选择一种联系方式");
					jError.removeClass("none");
					canSumbit = false;
				}
				canSumbit && jContractItemWrap.each(function(){
					var jThis = $(this),
						checked  = jThis.find("[type=checkbox]")[0].checked,
						jInput = $("input[type=text],textarea",jThis);
					if(checked && $.trim(jInput.val()) == ""){
						jError.html( "联系方式不能为空");
						jError.removeClass("none");
						canSumbit = false;
						return false;
					} 

				});
				if(canSumbit){
					jError.addClass("none");
				}
			}
			//手机号验证
			// if(canSumbit && !jMobileInput[0].disabled){
			// 	if(!/^0{0,1}(13[0-9]|15[0-9])[0-9]{8}$/.test(jMobileInput.val())){
			// 		$(".phoneErr").html("手机格式有误");
			// 		$(".phoneErr").removeClass("none");
			// 		canSumbit = false;
			// 	}else{
			// 		$(".phoneErr").addClass("none");
			// 	}
				
			// }
			//通过验证，提交
			if(canSumbit){
				$("#publishProdForm")[0].submit();
			}

		});
		//inputfocus时，错误提示隐藏

		//类型的切换
		$(".item input[type=checkbox]").click(function() {
			var jInput = $("input[type=text]",$(this).parents(".item"));
			if(this.checked){
				jInput[0].disabled = false;
			}else{
				jInput[0].disabled = true;
			}
		});
		$(".item input[type=radio]").click(function() {
			var allInput = $("input[type=text],input[type=file]",$(this).parents("dl"));
			if(this.checked){
				allInput.each(function () {
					this.disabled = true;
				});
				$("input[type=text],input[type=file]",$(this).parents(".item"))[0].disabled = false;
			}
		});
	};
	//关于我们
	function initAboutUs () {
		var jAboutUsHref = $(".aboutUsHref"),
			jAboutUsDetail = $("#aboutUs"),
			jAboutUsWin,
			jCloseAbout = $(".closeBtn",jAboutUsDetail);
			

		jAboutUsWin = jAboutUsHref.popup({
			pupupElem:jAboutUsDetail
		})
		jCloseAbout.click(function () {
			jAboutUsWin.close();
		});

	};
	//详情按钮
	function initShowDetail () {
		var jProdDetail = $("#prodDetail"),
			jDetailBtn = $(".getDetailBtn"),
			jCloseBtn = $(".closeBtn",jProdDetail),
			prodDetailWin;
		//获取宝贝详情
		jDetailBtn.click(function () {
			var prodId = $(this).attr("data-prodId"),
				prodData = data[prodId],
				contractInfo = "";
			if(prodData.imgSrc){
				$("img",jProdDetail).attr("src",prodData.imgSrc);
			}else{//暂无图片
				$("img",jProdDetail).attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADICAYAAABS39xVAAAEA0lEQVR4nO3YO3biMABA0dn/UrwBihQps5tsIdPlMBnjyMYZeJpb3ALwR8DRO7J+vb+/fwAU/Hr0AABGCRaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgTWRZlo9lWYaPGzn2jPte32+vn/wd6BGsiXydqMuyfLy8vOwOwdlhWRvXaOT2XHfPuTQJVtz15H99fV0NyVkT+Oh1bgVr7zGj4xGseQnWJNaCdf3ZMwZra6UmWKwRrAl8XU1dLpfP9249Eh6Z1GcEa3QFeHawRGwOgjWBPauVe6Nz77lb4Vo758j3PivQPB/BmszXCfr29jYcrCMBGAnCd1G6N1iP/s35dwQrbi0al8vlr89vvd5zn+s9siNj3Br3yDlHjmEugjWZ62CduZdzZrBuvd776HpkVUebYE1kZMI/Mlhrj6lb4TpjD+vR/wnnEqyJbEXhnom8d+WzNa6ta4+8P3LNo+Pk+QnWRH5q3+esYJ15zr2f0yRYE/mJYI1u2u9d7Xy36hMs1gjWREb2dPZM5K19plvHbl3nu/ucdb3RY+gRrImcOZGP7jkd2Y/aO07B+n8J1kTOWmGNxGLPtfeMa/Rao7/Fo/8TziVYfNr7yPjMZvke/EmwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvI+A0iufgj+5f9qwAAAABJRU5ErkJggg==");
			}
			
			$(".prodName",jProdDetail).html(prodData.name);
			$(".describe",jProdDetail).html(prodData.describe);
			$(".prodLabelWrap",jProdDetail).html("");
			prodData.label.split(",").forEach(function  (each) {
				$(".prodLabelWrap",jProdDetail).append('<span class="label label-info">'+each+'</span>');
			});
			$(".ownerName",jProdDetail).html(prodData.ownerName);
			if(prodData.mobile){
				contractInfo+=(prodData.mobile + " ");
			}
			if(prodData.qq){
				contractInfo+=("qq:"+prodData.qq);
			}
			$(".contractInfo",jProdDetail).html(contractInfo);

		})
		
		prodDetailWin = jDetailBtn.popup({
			pupupElem:jProdDetail
		});
		
		jCloseBtn.click(function () {
			prodDetailWin.close();
		});

		
	};
	//搜索宝贝
	var searchUrl = $("#jumpUrl").attr('data-serachUrl'),
		jWord = $("#searchInput");
	function searchProd () {
		var jSearchBtn = $("#searchProdBtn");
		jSearchBtn.click(function () {
			var word = encodeURIComponent(jWord.val());
			location.href = searchUrl.replace('{word}',word);
		});
	}

	
	
})(jQuery);