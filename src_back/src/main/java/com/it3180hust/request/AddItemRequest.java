package com.it3180hust.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class AddItemRequest {
    @NotNull(message = "Item's ID must not be null!")
    private Long productId;

    @NotBlank(message = "Item's size must not be null!")
    private String size;
    
    @Min(value = 1, message = "Item's quantity must be 1 or higher!")
    private int quantity;

    @PositiveOrZero(message = "Item's price must not be negative!")
    private Integer price;

    public AddItemRequest(){

    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }
}
