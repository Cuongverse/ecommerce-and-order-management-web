package com.it3180hust.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.it3180hust.exception.ProductException;
import com.it3180hust.model.Product;
import com.it3180hust.model.Rating;
import com.it3180hust.model.User;
import com.it3180hust.repository.ProductRepository;
import com.it3180hust.repository.RatingRepository;
import com.it3180hust.request.RatingRequest;

@Service 
public class RatingServiceImplementation implements RatingService{

    private RatingRepository ratingRepository;
    private ProductService productService;
    private ProductRepository productRepository;

    public RatingServiceImplementation(RatingRepository ratingRepository, ProductService productService , ProductRepository productRepository) {
        this.ratingRepository = ratingRepository;
        this.productService = productService;
        this.productRepository = productRepository ;
    }

    @Override
    public Rating createRating(RatingRequest req, User user) throws ProductException {
    Product product = productService.findProductById(req.getProductId());

        // Kiểm tra xem người dùng đã đánh giá sản phẩm này trước đó chưa
        Rating existingRating = ratingRepository.findByUserIdAndProductId(user.getId(), product.getId());

        if (existingRating != null) {
            // Nếu đã đánh giá: Cập nhật lại điểm số cũ
            existingRating.setRating(req.getRating());
            // Nếu có thêm trường nội dung/comment thì cập nhật ở đây
            existingRating.setCreatedAt(LocalDateTime.now());
            return ratingRepository.save(existingRating);
        }

        // Nếu chưa: Tạo đánh giá mới
        Rating rating = new Rating();
        rating.setProduct(product);
        rating.setUser(user);
        rating.setRating(req.getRating());
        rating.setCreatedAt(LocalDateTime.now());

        // Tăng biến đếm tổng số lượng đánh giá của sản phẩm lên 1
        product.setNumRatings(product.getNumRatings() + 1);
        productRepository.save(product);

        return ratingRepository.save(rating);
    }

    @Override
    public List<Rating> getProductsRating(Long productId) {
        return ratingRepository.getAllProductsRating(productId);
    }
}