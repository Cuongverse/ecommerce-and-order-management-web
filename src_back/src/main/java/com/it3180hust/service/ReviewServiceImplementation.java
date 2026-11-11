package com.it3180hust.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.it3180hust.exception.ProductException;
import com.it3180hust.model.Product;
import com.it3180hust.model.Review;
import com.it3180hust.model.User;
import com.it3180hust.repository.ReviewRepository;
import com.it3180hust.request.ReviewRequest;

@Service 
public class ReviewServiceImplementation implements ReviewService {

    private ReviewRepository reviewRepository;
    private ProductService productService;

    // không để constructor default vì Spring sẽ gọi nó thay vì constructor này
    // lí do: Khi Spring @Service có nhiều constructor mà không có @Autowired thì sẽ
    // mặc định gọi constructor default 
    public ReviewServiceImplementation(ReviewRepository reviewRepository, 
                                    ProductService productService) {
        this.reviewRepository = reviewRepository;
        this.productService = productService;
    }

    @Override
    public Review createReview(ReviewRequest req, User user) throws ProductException {
        Product product = productService.findProductById(req.getProductId());
        
        Review review = new Review();
        review.setReview(req.getReview());
        review.setUser(user);
        review.setProduct(product);
        review.setCreatedAt(LocalDateTime.now());
        
        Review savedReview = reviewRepository.save(review);
        return savedReview;
    }

    @Override
    // lấy tất cả review cho sản phẩm với id = productId
    public List<Review> getAllReview(Long productId) {
        return reviewRepository.getAllProductsReview(productId);
    }
}
