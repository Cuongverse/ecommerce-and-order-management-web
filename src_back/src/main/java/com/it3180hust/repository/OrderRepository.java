package com.it3180hust.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.it3180hust.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long>{
    @Query("SELECT o FROM Order o WHERE o.id = :orderId")
    public Order findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND (o.orderStatus = 'PLACED' OR o.orderStatus = 'CONFIRMED' OR o.orderStatus = 'SHIPPED' OR o.orderStatus = 'DELIVERED' OR o.orderStatus = 'PENDING' OR o.orderStatus = 'CREATED')")
    public List<Order> getUsersOrders(@Param("userId") Long userId);

    long countByOrderStatus(String orderStatus);

    @Query("SELECT COALESCE(SUM(o.totalDiscountedPrice), 0) FROM Order o WHERE o.orderStatus = :orderStatus")
    long sumDiscountedRevenueByStatus(@Param("orderStatus") String orderStatus);

    @Query("SELECT FUNCTION('YEAR', o.orderDate) AS year, FUNCTION('MONTH', o.orderDate) AS month, "
            + "SUM(o.totalDiscountedPrice) AS revenue "
            + "FROM Order o WHERE o.orderStatus = 'DELIVERED' AND o.orderDate >= :from AND o.orderDate < :to "
            + "GROUP BY FUNCTION('YEAR', o.orderDate), FUNCTION('MONTH', o.orderDate) "
            + "ORDER BY FUNCTION('YEAR', o.orderDate), FUNCTION('MONTH', o.orderDate)")
    List<MonthlyRevenueProjection> findDeliveredRevenueByMonth(
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
