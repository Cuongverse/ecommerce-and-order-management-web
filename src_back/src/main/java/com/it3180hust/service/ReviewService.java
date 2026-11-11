package com.it3180hust.service;

import java.util.List;

import com.it3180hust.exception.ProductException;
import com.it3180hust.model.Review;
import com.it3180hust.model.User;
import com.it3180hust.request.ReviewRequest;

public interface ReviewService {
    public Review createReview(ReviewRequest req, User user) throws ProductException;
    
    public List<Review> getAllReview(Long productId);
}
