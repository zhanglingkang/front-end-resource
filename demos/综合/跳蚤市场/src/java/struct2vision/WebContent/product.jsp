<%@page import="com.joel007.module.Product"%>
<%@page import="java.util.ArrayList"%>
<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%> 
<%@ taglib prefix="c" uri="/WEB-INF/c.tld"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>九彩跳蚤市场，发现二手好东西</title>
<%@ include file = "commonView/commonCss.html" %>
<link rel="stylesheet" type="text/css" href="<c:url value='/css/homePage.0.1.css' />" />
</head>
<body>
<s:url var="homePageUrl" action="homepage"></s:url>
        	 
<%@ include file = "commonView/commonHead.html" %>
<div id="content">
	<div id="middleCont">
		<% 
			Product[] prodData = (Product[])request.getAttribute("prods");
		%>
		<% if(prodData!=null && prodData.length > 0){ %>
			<ul class="thumbnails">
			<% for(int i=0,len = prodData.length; i < len;i++ ){ %>
			 	<li class="span4">
			 		<% Product eachProd = prodData[i]; %>
			 		<div class="thumbnail clearfix">
				 		<% if(eachProd.getImgSrc() != null && !eachProd.getImgSrc().equals("")){ %>
				 			<img src="<c:url value='<%= eachProd.getImgSrc() %>' />" alt="">
				 		<%}else{%>
				 			<img data-src="holder.js/300x200/text:暂无图片" alt="">
				 		<%} %>
				 		 <h3><%=eachProd.getName() %></h3>
				 		 <% if(eachProd.getLabel()!=null){ 
				 			 String[] labels = eachProd.getLabel().split(",");
				 			 for(int j = 0,labLen = labels.length;j < labLen;j++){
				 		 %>
				 		 	<span class="label label-info"><%= labels[j] %></span>
				 		 	<%} %>
				 		 <%} %>
				 		 <a class="btn btn-primary fr getDetailBtn" data-prodId = "<%= eachProd.getProdId() %>">详情</a>
					</div>
			<%} %>
			</ul>
		<% }else{%>	
			对不起，找不到你要找的宝贝。点击这儿
			<s:a href="%{homePageUrl}" title="跳转">跳转首页</s:a> 
		<%} %>
	</div>
	
	<!-- 弹出的宝贝详情 start  -->
		<div id="prodDetail" class="popupBox" style="display:none;"
		>
				<div class="boxHeader clearfix">
					<a class="closeBtn fr" title="关闭" href="javascript:void(0);">×</a>
					<div class="header-text">宝贝详情</div>
				</div>
				<div class="textDes">
					<img data-src="holder.js/300x200/text:暂无图片" alt="">
				    <h3 class="prodName"></h3>
			    	<p class="prodLabelWrap"></p>
			    	<p class="describe"></p>
			    	<dl class="clearfix">
			    		<dt>主人昵称</dt>
			    		<dd class="ownerName"></dd>
			    	</dl>
			    	<dl class="clearfix">
			    		<dt>联系方式</dt>
			    		<dd class="contractInfo"></dd>
			    	</dl>
				
			</div>
		</div>
		<!-- 弹出的宝贝详情 end  -->
		<!-- 弹出的关于我们 end  -->
		<div id="aboutUs" class="popupBox" style="display:none">
			<div class="boxHeader clearfix">
					<a class="closeBtn fr" title="关闭" href="javascript:void(0);">×</a>
					<div class="header-text">关于我们</div>
			</div>
			<p>我是一只前端攻城狮。做这个网站的初衷是为了处理家里的一些二手品。</p>
			<p>对该网站的不满或赞扬，请邮箱至 <a href="mailto:iamjoel007@gmail.com" target="_blank">iamjoel007@gmail.com</a>,或qq:570491525 ^-^</p>
				
		</div>
		<!-- 弹出的关于我们 end  -->
		<!-- 弹出的发布宝贝 start  -->
		<form action="/publishProd" type="post" id="publishProdForm" method="post"	enctype="multipart/form-data">
			<div id="publishProd" class="popupBox" style="display:none">
				<div class="boxHeader clearfix">
						<a class="closeBtn fr" title="关闭" href="javascript:void(0);">×</a>
						<div class="header-text">发布宝贝</div>
				</div>
				<div class="box-cont">
					<dl class="clearfix">
						<dt>宝贝图片</dt>
						<dd>
							<ul>
								<li class="item">
									<input type="radio" name="picType" checked="checked"/>选择文件<input type="file" class="ml10" name='productImgFile'/>
								</li>
								<li class="item">
									<input type="radio" name="picType"/>图片url<input type="text" disabled="disabled" class="ml10" value="http://" name='productImgUrl'/>
								</li>
							</ul>
						</dd>
					</dl>
					<dl class="clearfix">
						<dt><span class="necessIcon">*</span><label>宝贝名</label></dt>
						<dd><input type="text" name='name'/><span class="errMsg none"></span></dd>
					</dl>
					<dl class="clearfix">
						<dt><label>标签名</label></dt>
						<dd><input type="text" name='label'/><span class="tip">多个标签间以逗号分隔</span></dd>
					</dl>
					<dl class="clearfix">
						<dt><span class="necessIcon">*</span><label>宝贝描述</label></dt>
						<dd><textarea type="text" name='describe'></textarea><span class="errMsg none"></span></dd>
					</dl>
					<dl class="clearfix">
						<dt><span class="necessIcon">*</span><label>主人昵称</label></dt>
						<dd><input type="text" name='ownerName'/><span class="errMsg none"></span></dd>
					</dl>
					<dl class="clearfix contractWrap">
						<dt><span class="necessIcon">*</span><label>联系方式</label></dt>
						<dd>
							<ul>
								<li class="item"><input type="checkbox" name="contractType" checked="checked"/>手机<input type="text" class="ml10 mobileInput" name='mobile'/></li>
								<li class="item"><input type="checkbox" name="contractType"/>qq<input type="text" disabled="disaled" class="ml10" name="qq"/></li>
							</ul>
							<span class="errMsg none phoneErr"></span>
							
						</dd>
					</dl>
					<div class="tc">
						<button class="btn btn-success btn-large" type="submit" id="publishProdBtn">提交</button>
					</div>
					
				</div>
			</div>
		</form>
		
		<!-- 弹出的发布宝贝 end  -->
		<div id="jumpUrl" class="none" data-serachUrl='/searchProd?keyword={word}'></div> 
</div>

<%@ include file = "commonView/commonFoot.html" %>    	
<%@ include file = "commonView/commonScript.html" %>    	
<script type="text/javascript">
	var SAVE_SUC = 1,
		SAVE_FAI = 0,
		NOT_FROM_SAVEPAGE = 2;
	if(<%= (Integer)request.getAttribute("saveSucc") %> != NOT_FROM_SAVEPAGE){
		if(<%= (Integer)request.getAttribute("saveSucc") %>){
			alert('发布成功');
		}else{
			alert('发布失败');
		}
	}
	var data =  JSON.parse('<%= (String)request.getAttribute("prodDataStr") %>');//!防止对""进行编码
</script>
<script type="text/javascript" src="<c:url value='/js/pupup.js' />"></script>
<script type="text/javascript" src="<c:url value='/js/homePage.0.1.js' />"></script>


</body>
</html>