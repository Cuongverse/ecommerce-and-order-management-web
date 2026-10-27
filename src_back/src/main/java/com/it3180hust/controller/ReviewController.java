package com.it3180hust.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3180hust.model.User;
import com.it3180hust.exception.ProductException;
import com.it3180hust.exception.UserException;
import com.it3180hust.model.Review;
import com.it3180hust.request.ReviewRequest;
import com.it3180hust.service.ReviewService;
import com.it3180hust.service.UserService;

@RestController 
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired 
    private UserService userService;

    @Autowired 
    private ReviewService reviewService;

    @PostMapping("/create")
    public ResponseEntity<Review> createRating(@RequestBody ReviewRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException{
        User user = userService.findUserProfileByJwt(jwt);

        Review review = reviewService.createReview(req, user);
        
        return new ResponseEntity<>(review,HttpStatus.CREATED);
    }

    @GetMapping("product/{productId}")
    public ResponseEntity<List<Review>> getProductsReview(@PathVariable Long productId, 
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException{
        User user = userService.findUserProfileByJwt(jwt);

        List<Review> reviews = reviewService.getAllReview(productId);

        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }


}
