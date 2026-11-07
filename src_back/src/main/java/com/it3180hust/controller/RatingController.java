package com.it3180hust.controller;

import java.util.List;

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
import com.it3180hust.model.Rating;
import com.it3180hust.request.RatingRequest;
import com.it3180hust.service.RatingService;
import com.it3180hust.service.UserService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping("/api/ratings")
public class RatingController {
    private final UserService userService;
    private final RatingService ratingService;

    public RatingController(UserService userService, RatingService ratingService) {
        this.userService = userService;
        this.ratingService = ratingService;
    }

    @PostMapping("/create")
    public ResponseEntity<Rating> createRating(@Valid @RequestBody RatingRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException{
        User user = userService.findUserProfileByJwt(jwt);

        Rating rating = ratingService.createRating(req, user);
        
        return new ResponseEntity<>(rating,HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Rating>> getProductsRating(@PathVariable Long productId) throws UserException, ProductException{

        List<Rating> ratings = ratingService.getProductsRating(productId);

        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }
}
