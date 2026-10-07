package com.it3180hust.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.it3180hust.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long>{
    
}
