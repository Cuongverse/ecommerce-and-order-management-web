package com.it3180hust.service;

import org.springframework.stereotype.Service;

import com.it3180hust.model.OrderItem;
import com.it3180hust.repository.OrderItemRepository;

@Service 
public class OrderItemServiceImplementation implements OrderItemService{

    private OrderItemRepository orderItemRepository;

    @Override
    public OrderItem createOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }
    
}
