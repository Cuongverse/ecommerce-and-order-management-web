package com.it3180hust.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.it3180hust.exception.OrderException;
import com.it3180hust.model.Address;
import com.it3180hust.model.Cart;
import com.it3180hust.model.CartItem;
import com.it3180hust.model.Order;
import com.it3180hust.model.OrderItem;
import com.it3180hust.model.PaymentDetails;
import com.it3180hust.model.Product;
import com.it3180hust.model.User;
import com.it3180hust.repository.AddressRepository;
import com.it3180hust.repository.CartRepository;
import com.it3180hust.repository.OrderItemRepository;
import com.it3180hust.repository.OrderRepository;
import com.it3180hust.repository.ProductRepository;
import com.it3180hust.repository.UserRepository;

import jakarta.transaction.Transactional;

@Transactional(rollbackOn = Exception.class)
@Service 
public class OrderServiceImplementation implements OrderService {

    private OrderRepository orderRepository;
    private CartService cartService;
    private CartRepository cartRepository;
    private AddressRepository addressRepository;
    private UserRepository userRepository;
    private OrderItemRepository orderItemRepository;
    private ProductRepository productRepository;

    public OrderServiceImplementation(OrderRepository orderRepository,
            CartService cartService,
            CartRepository cartRepository,
            AddressRepository addressRepository,
            UserRepository userRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Order createOrder(User user, Address shippingAddress) throws OrderException {
        shippingAddress.setUser(user);
        Address address = addressRepository.save(shippingAddress);
        user.getAddress().add(address);
        userRepository.save(user);

        Cart cart = cartService.findUserCart(user.getId());
        List<OrderItem> orderItems = new ArrayList<>();
        Map<Product, Integer> requestedQuantities = new IdentityHashMap<>();

        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            if (product == null || item.getQuantity() <= 0) {
                throw new OrderException("Cart contains an invalid product quantity.");
            }
            requestedQuantities.merge(product, item.getQuantity(), Math::addExact);
        }

        for (Map.Entry<Product, Integer> entry : requestedQuantities.entrySet()) {
            Product product = entry.getKey();
            int availableQuantity = getAvailableQuantity(product);
            if (availableQuantity < entry.getValue()) {
                throw new OrderException("Product " + product.getTitle() + " is out of stock (available: " + availableQuantity + ")");
            }
        }

        for (Map.Entry<Product, Integer> entry : requestedQuantities.entrySet()) {
            Product product = entry.getKey();
            product.setReservedQuantity(product.getReservedQuantity() + entry.getValue());
            product.setQuantity(product.getPhysicalQuantity() - product.getReservedQuantity());
            productRepository.save(product);
        }

        for (CartItem item : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setPrice(item.getPrice());
            orderItem.setProduct(item.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSize(item.getSize());
            orderItem.setUserId(item.getUserId());
            orderItem.setDiscountedPrice(item.getDiscountedPrice());

            OrderItem createdOrderItem = orderItemRepository.save(orderItem);
            orderItems.add(createdOrderItem);
        }

        Order createdOrder = new Order();
        createdOrder.setUser(user);
        createdOrder.setOrderItems(orderItems);
        createdOrder.setTotalPrice(cart.getTotalPrice());
        createdOrder.setTotalDiscountedPrice(cart.getTotalDiscountedPrice());
        createdOrder.setDiscount(cart.getDiscount());
        createdOrder.setTotalItem((int) cart.getTotalItem());

        createdOrder.setShippingAddress(address);
        createdOrder.setOrderDate(LocalDateTime.now());
        createdOrder.setOrderStatus("PENDING");
        if (createdOrder.getPaymenDetails() == null) {
            createdOrder.setPaymenDetails(new PaymentDetails());
        }
        createdOrder.getPaymenDetails().setStatus("PENDING");
        createdOrder.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(createdOrder);

        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        // 2. Làm trống giỏ hàng sau khi đặt hàng thành công
        cart.getCartItems().clear();
        cart.setTotalPrice(0);
        cart.setTotalDiscountedPrice(0);
        cart.setTotalItem(0);
        cart.setDiscount(0);
        cartRepository.save(cart);

        return savedOrder;
    }

    @Override
    public Order findOrderById(Long orderId) throws OrderException {
        Optional<Order> opt = orderRepository.findById(orderId);
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new OrderException("Order Not Found With Id - " + orderId);
    }

    @Override
    public List<Order> usersOrderHistory(Long userId) {
        return orderRepository.getUsersOrders(userId);
    }

    @Override
    public Order placedOrder(long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("PLACED");
        if (order.getPaymenDetails() == null) {
            order.setPaymenDetails(new PaymentDetails());
        }
        order.getPaymenDetails().setStatus("COMPLETED");
        return orderRepository.save(order);
    }

    @Override
    public Order confirmedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("CONFIRMED");
        return orderRepository.save(order);
    }

    @Override
    public Order shippedOrder(long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        if ("SHIPPED".equalsIgnoreCase(order.getOrderStatus())) {
            return order;
        }
        if (!"CONFIRMED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new OrderException("Only confirmed orders can be shipped.");
        }

        Map<Product, Integer> productQuantities = getOrderProductQuantities(order);
        for (Map.Entry<Product, Integer> entry : productQuantities.entrySet()) {
            Product product = entry.getKey();
            int quantity = entry.getValue();
            getAvailableQuantity(product);
            if (product.getPhysicalQuantity() < quantity || product.getReservedQuantity() < quantity) {
                throw new OrderException("Product " + product.getTitle() + " has insufficient reserved stock to ship.");
            }
        }

        for (Map.Entry<Product, Integer> entry : productQuantities.entrySet()) {
            Product product = entry.getKey();
            int quantity = entry.getValue();
            product.setPhysicalQuantity(product.getPhysicalQuantity() - quantity);
            product.setReservedQuantity(product.getReservedQuantity() - quantity);
            product.setQuantity(product.getPhysicalQuantity() - product.getReservedQuantity());
            productRepository.save(product);
        }

        order.setOrderStatus("SHIPPED");
        return orderRepository.save(order);
    }

    @Override
    public Order deliveredOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("DELIVERED");
        return orderRepository.save(order);
    }

    @Override
    public Order canceledOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            return order;
        }
        if ("DELIVERED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new OrderException("Delivered orders cannot be cancelled.");
        }

        if (!"SHIPPED".equalsIgnoreCase(order.getOrderStatus())) {
            releaseReservedQuantity(order);
        }

        order.setOrderStatus("CANCELLED");
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public void deleteOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        if (!"SHIPPED".equalsIgnoreCase(order.getOrderStatus())
                && !"DELIVERED".equalsIgnoreCase(order.getOrderStatus())
                && !"CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            releaseReservedQuantity(order);
        }
        orderRepository.delete(order);
    }

    private int getAvailableQuantity(Product product) throws OrderException {
        int physicalQuantity = product.getPhysicalQuantity();
        int reservedQuantity = product.getReservedQuantity();
        if (physicalQuantity < 0 || reservedQuantity < 0 || reservedQuantity > physicalQuantity) {
            throw new OrderException("Product " + product.getTitle() + " has invalid stock quantities.");
        }
        return physicalQuantity - reservedQuantity;
    }

    private Map<Product, Integer> getOrderProductQuantities(Order order) throws OrderException {
        if (order.getOrderItems() == null) {
            throw new OrderException("Order has no items to process.");
        }

        Map<Product, Integer> productQuantities = new IdentityHashMap<>();
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product == null || item.getQuantity() <= 0) {
                throw new OrderException("Order contains an invalid product quantity.");
            }
            productQuantities.merge(product, item.getQuantity(), Math::addExact);
        }
        return productQuantities;
    }

    private void releaseReservedQuantity(Order order) throws OrderException {
        Map<Product, Integer> productQuantities = getOrderProductQuantities(order);
        for (Map.Entry<Product, Integer> entry : productQuantities.entrySet()) {
            Product product = entry.getKey();
            getAvailableQuantity(product);
            if (product.getReservedQuantity() < entry.getValue()) {
                throw new OrderException("Product " + product.getTitle() + " has insufficient reserved stock to release.");
            }
        }

        for (Map.Entry<Product, Integer> entry : productQuantities.entrySet()) {
            Product product = entry.getKey();
            product.setReservedQuantity(product.getReservedQuantity() - entry.getValue());
            product.setQuantity(product.getPhysicalQuantity() - product.getReservedQuantity());
            productRepository.save(product);
        }
    }
}
