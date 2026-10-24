package com.it3180hust.service;

import java.util.List;

import com.it3180hust.exception.ProductException;
import com.it3180hust.model.Rating;
import com.it3180hust.model.User;
import com.it3180hust.request.RatingRequest;

public interface RatingService {
    public Rating createRating(RatingRequest req, User user) throws ProductException;

    public List<Rating> getProductsRating(Long productId);
}
