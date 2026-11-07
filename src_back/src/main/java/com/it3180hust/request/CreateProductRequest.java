package com.it3180hust.request;

import java.util.HashSet;
import java.util.Set;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import com.it3180hust.model.Size;

public class CreateProductRequest {
    @NotBlank(message = "Title must not be blank!")
    private String title;
    private String description;

    @NotBlank(message = "Top level category is required!")
    private String topLevelCategory;
    
    @NotBlank(message = "Second level category is required!")
    private String secondLevelCategory;

    @NotBlank(message = "Third level category is required!")
    private String thirdLevelCategory;

    @NotBlank(message = "Image URL is required!")
    private String imageUrl;

    private String brand;
    private String color;

    @PositiveOrZero(message = "Price must be greater than or equal to 0!")
    private int price;

    @PositiveOrZero(message = "Price must be greater than or equal to 0!")
    private int discountedPrice;
    private double discountedPercent;
    private int quantity;
    private Set<Size> size = new HashSet<>();

    public CreateProductRequest(){
        
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public int getPrice() {
        return price;
    }
    public void setPrice(int price) {
        this.price = price;
    }
    public int getDiscountedPrice() {
        return discountedPrice;
    }
    public void setDiscountedPrice(int discountedPrice) {
        this.discountedPrice = discountedPrice;
    }
    public double getDiscountedPercent() {
        return discountedPercent;
    }
    public void setDiscountedPercent(double discountedPercent) {
        this.discountedPercent = discountedPercent;
    }
    public int getQuantity() {
        return quantity;
    }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    public String getBrand() {
        return brand;
    }
    public void setBrand(String brand) {
        this.brand = brand;
    }
    public String getColor() {
        return color;
    }
    public void setColor(String color) {
        this.color = color;
    }
    public Set<Size> getSize() {
        return size;
    }
    public void setSize(Set<Size> size) {
        this.size = size;
    }
    public String getImageUrl() {
        return imageUrl;
    }
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    public String getTopLevelCategory() {
        return topLevelCategory;
    }
    public void setTopLevelCategory(String topLevelCategory) {
        this.topLevelCategory = topLevelCategory;
    }
    public String getSecondLevelCategory() {
        return secondLevelCategory;
    }
    public void setSecondLevelCategory(String secondLevelCategory) {
        this.secondLevelCategory = secondLevelCategory;
    }
    public String getThirdLevelCategory() {
        return thirdLevelCategory;
    }
    public void setThirdLevelCategory(String thirdLevelCategory) {
        this.thirdLevelCategory = thirdLevelCategory;
    }
}
