package com.joel007.module;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Date;

public class Product {
	private int prodId;
	private String name = "";
	private String imgSrc  = "";
	private String label = "";
	private String qq = "";
	private String mobile = "";
	private String ownerName = "";
	private String describe = "";
	private String searchStr = "";
	private Date updateTime;
	
	public Product(){
		this.updateTime = new Date();
	}
	public Product(String name, String imgSrc, String label, String qq,
			String mobile, String ownerName, String describe, String searchStr) {
		this.name = name;
		this.imgSrc = imgSrc;
		this.label = label;
		this.qq = qq;
		this.mobile = mobile;
		this.ownerName = ownerName;
		this.describe = describe;
		this.searchStr = name + "|" +label + "|" + describe;
		this.updateTime = new Date();
	}
	
	public int getProdId() {
		return prodId;
	}
	public void setProdId(int prodId) {
		this.prodId = prodId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getImgSrc() {
		return imgSrc;
	}
	public void setImgSrc(String imgSrc) {
		this.imgSrc = imgSrc;
	}
	public String getLabel() {
		return label;
	}
	public void setLabel(String label) {
		this.label = label;
	}
	public String getQq() {
		return qq;
	}
	public void setQq(String qq) {
		this.qq = qq;
	}
	public String getMobile() {
		return mobile;
	}
	public void setMobile(String mobile) {
		this.mobile = mobile;
	}
	public String getOwnerName() {
		return ownerName;
	}
	public void setOwnerName(String ownerName) {
		this.ownerName = ownerName;
	}
	public String getDescribe() {
		return describe;
	}
	public void setDescribe(String describe) {
		this.describe = describe;
	}
	public String getSearchStr() {
		return searchStr;
	}
	public void setSearchStr(String searchStr) {
		this.searchStr = searchStr;
	}
	public Date getUpdateTime() {
		return updateTime;
	}
	public void setUpdateTime(Date updateTime) {
		this.updateTime = updateTime;
	}
	
	public String toString(){
		StringBuffer sb = new StringBuffer();
		Field[] fields = this.getClass().getFields();
		try {
			for(int i = 0,len = fields.length; i < len; i++){
				Field eachField = fields[i];
				String fieldName = eachField.getName();
				String getFnName = "get" + fieldName.substring(0,1).toUpperCase() + fieldName.substring(1);
				sb.append(eachField.getName());
				sb.append(" : ");
				sb.append(eachField.get(this).toString());
//				sb.append((String)invoke(this.getClass(), this, getFnName, null, null));
				sb.append("\n");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return sb.toString();
	}
	
	public String toJson(){
		StringBuffer sb = new StringBuffer();
			sb.append(wrapStr(getProdId() + "") + ":");
				sb.append("{");
					sb.append("\"prodId\":");
					sb.append(wrapStr(getProdId()+"")+",");
					sb.append("\"name\":");
					sb.append(wrapStr(getName())+",");
					sb.append("\"label\":");
					sb.append(wrapStr(getLabel())+",");
					sb.append("\"imgSrc\":");
					sb.append(wrapStr(getImgSrc())+",");					
					sb.append("\"qq\":");
					sb.append(wrapStr(getQq())+",");					
					sb.append("\"mobile\":");
					sb.append(wrapStr(getMobile())+",");
					sb.append("\"ownerName\":");
					sb.append(wrapStr(getOwnerName())+",");					
					sb.append("\"describe\":");
					sb.append(wrapStr(getDescribe()));
					
				sb.append("}");
		
		return sb.toString();
	}
	
	private String wrapStr(String str){
		return "\"" + str + "\"";
	}
	private String getJsonItem(String str){
		//若传如name 怎返回  "\"name\":" + wrapStr(getName()) 以后优化
		return "";
	}
	
	/**
	* Invokes accessible method of an object.
	*
	* @param c class that contains method
	* @param obj object to execute
	* @param method method to invoke
	* @param paramClasses classes of parameters
	* @param params parameters
	*/
	public static Object invoke(Class c, Object obj, String method, Class[] paramClasses, Object[] params) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
		Method m = c.getMethod(method, paramClasses);
		return m.invoke(obj, params);
	}
	
	
}
