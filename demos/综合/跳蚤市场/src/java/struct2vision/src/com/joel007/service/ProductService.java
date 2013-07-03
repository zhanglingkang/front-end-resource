package com.joel007.service;

import java.sql.*;
import java.util.ArrayList;

import com.joel007.dao.productDao;
import com.joel007.module.Product;
import com.joel007.service.MyConnect;

public class ProductService implements productDao{
	public Product[] getAllProd() {
		String sql = "SELECT * FROM productinfo";
		return getProd(sql);
	}

	public Product[] getProdByWord(String keyWord) {
		String sql = "SELECT * FROM productinfo where searchStr like \'%" + keyWord + "%\'";
		return getProd(sql);
	}
	
	
	private Product[] getProd(String sql) {
		ArrayList<Product> prods = new ArrayList<Product>();
		Statement stmt = null;
		ResultSet rs = null;
		try {
			stmt = conn.createStatement();
//			System.out.println(sql);
			rs = stmt.executeQuery(sql);
			while(rs.next()){
				int index = 1;
				Product prod = new Product();
				prod.setProdId(rs.getInt(index++));
				prod.setName(rs.getString(index++));
				prod.setImgSrc(rs.getString(index++));
				prod.setLabel(rs.getString(index++));
				prod.setQq(rs.getString(index++));
				prod.setMobile(rs.getString(index++));
				prod.setOwnerName(rs.getString(index++));
				prod.setDescribe(rs.getString(index++));
				prod.setUpdateTime(rs.getDate(index++));
				prod.setSearchStr(rs.getString(index++));
				
				prods.add(prod);
			}
		} catch (SQLException e) {
			System.out.println("查询prod错误");
			e.printStackTrace();
		}
		
		
		try {
			if(rs != null){
				rs.close();
				rs = null;
			}
			if(stmt != null){
				stmt.close();
				stmt = null;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
			
		
		return (Product[])prods.toArray(new Product[prods.size()]);
	} 
	
	public boolean addProd(Product prod) {
		try {
			Statement stmt = conn.createStatement();
			String sql = getAddSql(prod);
			stmt.executeUpdate(sql);
			System.out.println("保存成功!");
			return true;
		} catch (SQLException e) {
			System.out.println("保存失败!");
			e.printStackTrace();
			return false;

		}
		
	}
	private String getAddSql(Product prod){
		String sql;
		String[] keys = {prod.getName(),prod.getImgSrc(),prod.getLabel(),prod.getQq(),prod.getMobile(),prod.getOwnerName(),prod.getDescribe(),prod.getSearchStr()};
		sql = "INSERT INTO productinfo(name,imgSrc,label,qq,mobile,describe,describe,searchStr,updateTime) VALUES (" + Join(keys) + "," + prod.getUpdateTime().toString()+ ")";
		return sql;
	}
	private static String Join(String[] str){
		return Join(str,",");
	}
	private static String Join(String[] strArr,String split){
		StringBuffer bf = new StringBuffer();
		for(int i=0, len = strArr.length; i < len;i++ ){
			bf.append(strArr[i]);
			bf.append(split);
		}
		return bf.toString();
	}
	private Connection conn = new  MyConnect().getConn();

}
//class Test{
//	public static void main(){
//		ProductService prodSer = new ProductService();
//		Product prod1 = new Product();
//		prod1.setName("name");
//		prod1.setImgSrc("//dfd");
//		prod1.setLabel("label");
//		prod1.setQq("qq");
//		prod1.setMobile("mobile");
//		prod1.setDescribe("label");
//		prod1.setOwnerName("ownerName");
//		prodSer.addProd(prod1);
//	}
//}
