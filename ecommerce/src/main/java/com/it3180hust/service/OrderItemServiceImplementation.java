package com.it3180hust.service;

import com.it3180hust.model.OrderItem;
import com.it3180hust.repository.OrderItemRepository;

public class OrderItemServiceImplementation implements OrderItemService{

    private OrderItemRepository orderItemRepository;

    @Override
    public OrderItem createOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }
    
}
