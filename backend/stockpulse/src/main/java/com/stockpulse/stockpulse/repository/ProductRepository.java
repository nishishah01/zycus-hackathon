package com.stockpulse.stockpulse.repository;

import com.stockpulse.stockpulse.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findByStatus(Product.ProductStatus status);

    List<Product> findByCategory(Product.Category category);
}