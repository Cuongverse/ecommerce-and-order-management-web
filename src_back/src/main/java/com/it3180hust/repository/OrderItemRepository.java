package com.it3180hust.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.it3180hust.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}

