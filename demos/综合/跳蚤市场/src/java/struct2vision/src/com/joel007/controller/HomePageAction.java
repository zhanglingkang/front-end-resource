package com.joel007.controller;

import java.util.ArrayList;

import com.joel007.module.Product;
import com.joel007.service.ProductService;
import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;

/**
 * @author Joel
 *
 */
public class HomePageAction extends ActionSupport{
	private static final long serialVersionUID = 1L;
	ProductService prodSer = new ProductService();
	final int SAVE_SUC = 1,
			SAVE_FAI = 0,
			NOT_FROM_SAVEPAGE = 2;
	public String execute() throws Exception{
		Product[] products = prodSer.getAllProd(); 
		StringBuffer prodDataSb = new StringBuffer();
		prodDataSb.append("{");
		for(int i=0,len = products.length; i < len; i++){
			System.out.println(products[i]);
			prodDataSb.append(products[i].toJson());
			if(i < len-1){
				prodDataSb.append(",");
			}
		}
		prodDataSb.append("}");
		ActionContext ctx = ActionContext.getContext();
		//if(ctx.getSession().get("fromPublidPage") == null){
//			ctx.getSession().put("saveSucc",NOT_FROM_SAVEPAGE);
//			ctx.getSession().put("prodDataStr",prodDataSb.toString());
			ctx.put("saveSucc",NOT_FROM_SAVEPAGE);
			ctx.put("prodDataStr",prodDataSb.toString());
		//}
		ctx.put("prods",products);//放到request对象中
//		ctx.getSession().put("prods",products);//放到session中
		return SUCCESS;
	}
	
}
