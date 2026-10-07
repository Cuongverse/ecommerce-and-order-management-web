package com.it3180hust.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.it3180hust.exception.OrderException;
import com.it3180hust.model.Address;
import com.it3180hust.model.Order;
import com.it3180hust.model.User;
import com.it3180hust.repository.CartRepository;
import com.it3180hust.repository.OrderRepository;

@Service 
public class OrderServiceImplementation implements OrderService{

    private CartRepository cartRepository;
    private CartItemService cartItemService;
    private ProductService productService;
    private OrderRepository orderRepository;

    public OrderServiceImplementation(CartRepository cartRepository, 
        CartItemService cartItemService,
        ProductService productService){
        this.cartItemService = cartItemService;
        this.cartRepository = cartRepository;
        this.productService = productService;
    }

    @Override
    public Order canceledOrder(Long orderId) throws OrderException {
        
        return null;
    }

    @Override
    public Order confirmedOrder(Long orderId) throws OrderException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Order createOrder(User user, Address shippingAddress) {
        Order order = new Order();
        order.setId(user.getId());
        
        return null;
    }

    @Override
    public void deleteOrder(Long OrderId) throws OrderException {
        // TODO Auto-generated method stub
        
    }

    @Override
    public Order deliveredOrder(Long orderId) throws OrderException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Order findOrderById(Long orderId) throws OrderException {
        Optional<Order> order = orderRepository.findById(orderId);
        if(order.isPresent()){
            return order.get();
        }
        throw new OrderException("Order Not Found With Id - " + orderId);
    }

    @Override
    public List<Order> getAllOrders() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Order placedOrder(long orderId) throws OrderException {
        



        return null;
    }

    @Override
    public Order shippedOrder(long orderId) throws OrderException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<Order> usersOrderHistory(Long userId) {
        // TODO Auto-generated method stub
        return null;
    }
    
}
