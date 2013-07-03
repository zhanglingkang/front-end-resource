package com.joel007.service;


import java.sql.DriverManager;
import java.sql.SQLException;

import com.joel007.dao.MyConnectDao;
import java.sql.Connection;

public class MyConnect implements MyConnectDao{
	static private String url = "jdbc:mysql://localhost:3306/secondhandproduct?user=root&password=ok";
	public Connection getConn() {
		Connection conn;
		try {
			Class.forName("com.mysql.jdbc.Driver");
			conn = DriverManager.getConnection(url);
			return conn;
		} catch (ClassNotFoundException e) {
			System.out.println("找不到驱动类");
			e.printStackTrace();
			return null;
		}catch (SQLException e) {
			System.out.println("连接MySQL错误");
			e.printStackTrace();
			return null;
		} 
	}

}
