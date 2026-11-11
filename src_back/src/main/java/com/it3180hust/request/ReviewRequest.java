package com.it3180hust.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReviewRequest {
    @NotNull(message = "Product's ID is required!")
    private Long productId;
    
    @NotBlank(message = "Review must not be left blank!")
    @Size (min = 10, max = 200, message = "A review must be between 10 and 200 characters!")
    private String review;
    
    public Long getProductId() {
        return productId;
    }
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    public String getReview() {
        return review;
    }
    public void setReview(String review) {
        this.review = review;
    }
}
