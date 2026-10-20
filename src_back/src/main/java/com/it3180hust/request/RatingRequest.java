package com.it3180hust.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class RatingRequest {
    @NotNull(message = "Product's ID is required!")
    private Long productId;

    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0!")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5.0!")
    private double rating;

    public Long getProductId(){
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }
}
