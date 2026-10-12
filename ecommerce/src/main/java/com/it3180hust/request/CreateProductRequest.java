package com.it3180hust.request;

import java.util.HashSet;
import java.util.Set;

import com.it3180hust.model.Size;

public class CreateProductRequest {
    private String title;
    private String description;
    private String topLevelCategory;
    private String secondLevelCategory;
    private String thirdLevelCategory;
    private String imageUrl;

    private String brand;
    private String color;

    private int price;
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
