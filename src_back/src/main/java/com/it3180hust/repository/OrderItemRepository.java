package com.it3180hust.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.it3180hust.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT p.id AS productId, p.title AS productTitle, SUM(oi.quantity) AS quantitySold "
            + "FROM OrderItem oi JOIN oi.order o JOIN oi.product p "
            + "WHERE o.orderStatus = 'DELIVERED' "
            + "GROUP BY p.id, p.title "
            + "ORDER BY SUM(oi.quantity) DESC, p.id ASC")
    List<TopSellingProductProjection> findTopSellingDeliveredProducts(Pageable pageable);
}

