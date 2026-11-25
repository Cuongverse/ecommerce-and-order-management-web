package com.it3180hust.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.it3180hust.model.Order;
import com.it3180hust.model.OrderItem;
import com.it3180hust.model.Product;
import com.it3180hust.model.User;
import com.it3180hust.repository.OrderItemRepository;
import com.it3180hust.repository.OrderRepository;
import com.it3180hust.repository.ProductRepository;
import com.it3180hust.repository.UserRepository;

@SpringBootTest
@Transactional
class AdminAnalyticsRepositoryTest {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;

    @Test
    void aggregatesDeliveredRevenueAndProductSalesForTheCurrentMonth() {
        long initialRevenue = orderRepository.sumDiscountedRevenueByStatus("DELIVERED");
        long initialSuccessfulOrders = orderRepository.countByOrderStatus("DELIVERED");
        long initialCancelledOrders = orderRepository.countByOrderStatus("CANCELLED");
        long initialCustomers = userRepository.countByRole("ROLE_USER");

        User customer = new User();
        customer.setEmail("analytics-customer@example.com");
        customer.setRole("ROLE_USER");
        userRepository.save(customer);

        Product product = new Product();
        product.setTitle("Analytics product");
        product = productRepository.save(product);

        Order deliveredOrder = createOrder(customer, "DELIVERED", 100, LocalDateTime.now());
        Order cancelledOrder = createOrder(customer, "CANCELLED", 500, LocalDateTime.now());

        OrderItem item = new OrderItem();
        item.setOrder(deliveredOrder);
        item.setProduct(product);
        item.setQuantity(3);
        orderItemRepository.save(item);

        AdminAnalyticsService service = new AdminAnalyticsService(
                orderRepository, orderItemRepository, userRepository);

        var summary = service.getSummary();
        assertEquals(initialRevenue + 100, summary.totalRevenue());
        assertEquals(initialSuccessfulOrders + 1, summary.successfulOrders());
        assertEquals(initialCancelledOrders + 1, summary.cancelledOrders());
        assertEquals(initialCustomers + 1, summary.totalCustomers());

        var topProduct = service.getTopSellingProducts().get(0);
        assertEquals(product.getId(), topProduct.productId());
        assertEquals(3L, topProduct.quantitySold());

        List<com.it3180hust.response.MonthlyRevenueResponse> monthlyRevenue = service.getRevenueByMonth();
        assertEquals(12, monthlyRevenue.size());
        assertEquals(YearMonth.now().toString(), monthlyRevenue.get(11).month());
        assertEquals(100L, monthlyRevenue.get(11).revenue());
    }

    private Order createOrder(User customer, String status, int discountedPrice, LocalDateTime orderDate) {
        Order order = new Order();
        order.setUser(customer);
        order.setOrderStatus(status);
        order.setTotalPrice(discountedPrice);
        order.setTotalDiscountedPrice(discountedPrice);
        order.setOrderDate(orderDate);
        order.setCreatedAt(orderDate);
        return orderRepository.save(order);
    }
}
