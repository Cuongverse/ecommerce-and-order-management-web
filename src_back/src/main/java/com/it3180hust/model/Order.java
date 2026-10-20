package com.it3180hust.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.cglib.core.Local;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity 
@Table(name = "orders")
public class Order {
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name="order_id")
    private String orderId;
    private String orderStatus;

    @ManyToOne 
    private User user;

    @OneToMany(mappedBy="order",cascade = CascadeType.ALL)
    private List<OrderItem>orderItems = new ArrayList<>();

    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private LocalDateTime createdAt;

    @OneToOne 
    private Address shippingAddress;

    @Embedded 
    private PaymentDetails paymenDetails = new PaymentDetails();

    private double totalPrice;

    private Integer totalDiscountedPrice;
    private Integer discount;
    private int totalItem;

    public Order(){

    }

    public Order(Long id, String orderId, String orderStatus, User user, List<OrderItem> orderItems,
            LocalDateTime orderDate, LocalDateTime deliveryDate, LocalDateTime createdAt, Address shippingAddress,
            PaymentDetails paymenDetails, double totalPrice, Integer totalDiscountedPrice, Integer discount,
            int totalItem) {
        this.id = id;
        this.orderId = orderId;
        this.orderStatus = orderStatus;
        this.user = user;
        this.orderItems = orderItems;
        this.orderDate = orderDate;
        this.deliveryDate = deliveryDate;
        this.createdAt = createdAt;
        this.shippingAddress = shippingAddress;
        this.paymenDetails = paymenDetails;
        this.totalPrice = totalPrice;
        this.totalDiscountedPrice = totalDiscountedPrice;
        this.discount = discount;
        this.totalItem = totalItem;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Address getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(Address shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public PaymentDetails getPaymenDetails() {
        return paymenDetails;
    }

    public void setPaymenDetails(PaymentDetails paymenDetails) {
        this.paymenDetails = paymenDetails;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Integer getTotalDiscountedPrice() {
        return totalDiscountedPrice;
    }

    public void setTotalDiscountedPrice(Integer totalDiscountedPrice) {
        this.totalDiscountedPrice = totalDiscountedPrice;
    }

    public Integer getDiscount() {
        return discount;
    }

    public void setDiscount(Integer discount) {
        this.discount = discount;
    }

    public int getTotalItem() {
        return totalItem;
    }

    public void setTotalItem(int totalItem) {
        this.totalItem = totalItem;
    }
}
