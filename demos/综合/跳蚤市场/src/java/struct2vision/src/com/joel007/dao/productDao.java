package com.joel007.dao;

import com.joel007.module.Product;

public interface productDao {
	public Product[] getAllProd();
	public Product[] getProdByWord(String keyWord);
	public boolean addProd(Product prod);
}
