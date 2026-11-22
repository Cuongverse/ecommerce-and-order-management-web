package com.it3180hust.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.it3180hust.model.Order;
import com.it3180hust.service.OrderService;

@Component
public class OrderScheduler {

    private final OrderService orderService;

    public OrderScheduler(OrderService orderService) {
        this.orderService = orderService;
    }

    @Scheduled(fixedRate = 60000)
    public void cancelExpiredOrders() {

        List<Order> orders = orderService.getAllOrders();

        LocalDateTime now = LocalDateTime.now();

        for (Order order : orders) {

            if ("PENDING".equalsIgnoreCase(order.getOrderStatus())
                    && order.getCreatedAt() != null
                    && order.getCreatedAt().isBefore(now.minusMinutes(15))) {

                try {
                    orderService.canceledOrder(order.getId());
                } catch (Exception e) {
                    System.err.println("Cannot cancel order: " + order.getId());
                }
            }
        }
    }
}