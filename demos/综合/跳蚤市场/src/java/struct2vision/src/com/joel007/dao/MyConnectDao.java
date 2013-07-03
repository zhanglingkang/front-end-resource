package com.joel007.dao;

import java.sql.Connection;

public interface MyConnectDao {
	public abstract Connection getConn();
}
