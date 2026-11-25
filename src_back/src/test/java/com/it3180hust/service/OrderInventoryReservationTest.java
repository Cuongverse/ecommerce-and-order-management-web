package com.it3180hust.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.it3180hust.exception.OrderException;
import com.it3180hust.model.Address;
import com.it3180hust.model.Cart;
import com.it3180hust.model.CartItem;
import com.it3180hust.model.Order;
import com.it3180hust.model.OrderItem;
import com.it3180hust.model.Product;
import com.it3180hust.model.User;
import com.it3180hust.repository.AddressRepository;
import com.it3180hust.repository.CartRepository;
import com.it3180hust.repository.OrderItemRepository;
import com.it3180hust.repository.OrderRepository;
import com.it3180hust.repository.ProductRepository;
import com.it3180hust.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class OrderInventoryReservationTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CartService cartService;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private ProductRepository productRepository;

    private OrderServiceImplementation orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderServiceImplementation(orderRepository, cartService, cartRepository,
                addressRepository, userRepository, orderItemRepository, productRepository);
    }

    @Test
    void creatingOrderReservesStockWithoutReducingPhysicalQuantity() throws Exception {
        Product product = productWithStock(10, 2);
        User user = new User();
        user.setId(1L);
        Cart cart = new Cart();
        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setQuantity(3);
        cart.setCartItems(new HashSet<>(List.of(cartItem)));

        when(cartService.findUserCart(1L)).thenReturn(cart);
        when(addressRepository.save(any(Address.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        orderService.createOrder(user, new Address());

        assertEquals(10, product.getPhysicalQuantity());
        assertEquals(5, product.getReservedQuantity());
        assertEquals(5, product.getQuantity());
    }

    @Test
    void creatingOrderRejectsQuantityAboveAvailableStock() throws Exception {
        Product product = productWithStock(10, 8);
        User user = new User();
        user.setId(1L);
        Cart cart = new Cart();
        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setQuantity(3);
        cart.setCartItems(new HashSet<>(List.of(cartItem)));
        when(cartService.findUserCart(1L)).thenReturn(cart);

        assertThrows(OrderException.class, () -> orderService.createOrder(user, new Address()));
        assertEquals(8, product.getReservedQuantity());
    }

    @Test
    void shippingOrderDeductsPhysicalAndReservedQuantity() throws Exception {
        Product product = productWithStock(10, 3);
        Order order = orderWithItem("CONFIRMED", product, 3);
        when(orderRepository.findById(2L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        orderService.shippedOrder(2L);

        assertEquals(7, product.getPhysicalQuantity());
        assertEquals(0, product.getReservedQuantity());
        assertEquals(7, product.getQuantity());
    }

    @Test
    void cancellingUnshippedOrderReleasesReservationOnly() throws Exception {
        Product product = productWithStock(10, 3);
        Order order = orderWithItem("PENDING", product, 3);
        when(orderRepository.findById(3L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        orderService.canceledOrder(3L);

        assertEquals(10, product.getPhysicalQuantity());
        assertEquals(0, product.getReservedQuantity());
        assertEquals(10, product.getQuantity());
    }

    private Product productWithStock(int physicalQuantity, int reservedQuantity) {
        Product product = new Product();
        product.setTitle("Test product");
        product.setPhysicalQuantity(physicalQuantity);
        product.setReservedQuantity(reservedQuantity);
        product.setQuantity(physicalQuantity - reservedQuantity);
        return product;
    }

    private Order orderWithItem(String status, Product product, int quantity) {
        Order order = new Order();
        order.setOrderStatus(status);
        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        order.setOrderItems(List.of(item));
        return order;
    }
}
