package com.it3180hust.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.it3180hust.exception.ProductException;
import com.it3180hust.model.Category;
import com.it3180hust.model.Product;
import com.it3180hust.repository.CategoryRepostiory;
import com.it3180hust.repository.ProductRepository;
import com.it3180hust.request.CreateProductRequest;

@Service
public class ProductServiceImplementation implements ProductService{

    private ProductRepository productRepository;
    private CategoryRepostiory categoryRepository;

    public ProductServiceImplementation(ProductRepository productRepository, UserService userService,
    CategoryRepostiory categoryRepostiory){
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepostiory;
    }
    
    @Override
    public Product createProduct(CreateProductRequest req) {
        Category topLevel = categoryRepository.findByName(req.getTopLevelCategory());

        if (topLevel == null){
            Category topLevelCategory = new Category();
            topLevelCategory.setName(req.getTopLevelCategory());
            topLevelCategory.setLevel(1);
            topLevel = categoryRepository.save(topLevelCategory);
        }

        Category secondLevel = categoryRepository.
            findByNameAndParent(req.getSecondLevelCategory(), topLevel.getName());
        if (secondLevel == null){
            Category secondLevelCategory = new Category();
            secondLevelCategory.setName(req.getSecondLevelCategory());
            secondLevelCategory.setLevel(2);
            secondLevel = categoryRepository.save(secondLevelCategory);
        }
        secondLevel.setParentCategory(topLevel);

        Category thirdLevel = categoryRepository.
            findByNameAndParent(req.getThirdLevelCategory(), secondLevel.getName());
        if (thirdLevel == null){
            Category thirdLevelCategory = new Category();
            thirdLevelCategory.setName(req.getThirdLevelCategory());
            thirdLevelCategory.setLevel(3);
            thirdLevel = categoryRepository.save(thirdLevelCategory);
        }
        thirdLevel.setParentCategory(secondLevel);

        Product product = new Product();
        product.setTitle(req.getTitle());
        product.setColor(req.getColor());
        product.setDescription(req.getDescription());
        product.setDiscountedPrice(req.getDiscountedPrice());
        product.setDiscountedPercent(req.getDiscountedPercent());
        product.setImageUrl(req.getImageUrl());
        product.setBrand(req.getBrand());
        product.setPrice(req.getPrice());
        product.setSizes(req.getSize());
        product.setQuantity(req.getQuantity());
        product.setCategory(thirdLevel);
        product.setCreatedAt(LocalDateTime.now());

        Product savedProduct = productRepository.save(product);

        return savedProduct;
    }

    @Override
    public String deleteProduct(Long productId) throws ProductException {
        Product product = findProductById(productId);
        product.getSizes().clear();
        productRepository.delete(product);
        return "Product Deleted Successfully.";
    }

    @Override
    public List<Product> findProductByCategory(String category) {
        
        return null;
    }

    @Override
    public Product findProductById(Long id) throws ProductException {
        Optional<Product> opt = productRepository.findById(id);

        if(opt.isPresent()){
            return opt.get();
        }
        throw new ProductException("Product Not Found With Id - " + id);
    }

    @Override
    public Page<Product> getAllProducts(String category, List<String> colors, List<String> sizes, Integer minPrice,
            Integer maxPrice, Integer minDiscount, String sort, String stock, Integer pageNumber, Integer pageSize) {
        
        PageRequest pageable = PageRequest.of(pageNumber, pageSize);

        List<Product> products = productRepository.filterProducts(category, minPrice, maxPrice, minDiscount, sort);

        if (colors != null && !colors.isEmpty()){
            // lọc màu xem có sản phẩm nào trùng với màu được request không và sau đó tạo ra một list
            // VD: p1 red, p2 white, p3 yellow; cần lọc red, yellow --> tạo một list gồm các sản phẩm thỏa mãn [p1,p3]
            products = products.stream().filter(p-> colors.stream().anyMatch(c->c.equalsIgnoreCase(p.getColor())))
                .collect(Collectors.toList());
        }
        if (stock != null){
            if (stock.equals("in_stock")){
                products = products.stream().filter(p -> p.getQuantity() > 0).collect(Collectors.toList());
            }
            else if(stock.equals("out_of_stock")){
                products = products.stream().filter(p -> p.getQuantity() < 1).collect(Collectors.toList());
            }
        }

        int startIndex = (int) pageable.getOffset();
        int endIndex = Math.min(startIndex + pageable.getPageSize(), products.size());

        List<Product> pageContent = (startIndex <= endIndex) ? products.subList(startIndex, endIndex) : Collections.emptyList();

        Page<Product> filteredProducts = new PageImpl<>(pageContent, pageable, products.size());

        return filteredProducts;
    }

    @Override
    public Product updateProduct(Long productId, Product req) throws ProductException {
        Product product = findProductById(productId);

        if (req.getQuantity() != 0){
            product.setQuantity(req.getQuantity());
        }

        Product savedProduct = productRepository.save(product);

        return savedProduct;
    }

    @Override 
    public List<Product> findAllProducts() {
        return productRepository.findAll();
    }
    
}
