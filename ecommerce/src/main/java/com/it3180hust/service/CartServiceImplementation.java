package com.it3180hust.service;

import org.springframework.stereotype.Service;

import com.it3180hust.exception.ProductException;
import com.it3180hust.model.Cart;
import com.it3180hust.model.CartItem;
import com.it3180hust.model.Product;
import com.it3180hust.model.User;
import com.it3180hust.repository.CartItemRepository;
import com.it3180hust.repository.CartRepository;
import com.it3180hust.request.AddItemRequest;

@Service 
public class CartServiceImplementation implements CartService {

    private CartRepository cartRepository;
    private CartItemService cartItemService;
    private ProductService productService;
    private CartItemRepository cartItemRepository;

    

    public CartServiceImplementation(CartRepository cartRepository, CartItemService cartItemService,
            ProductService productService) {
        this.cartRepository = cartRepository;
        this.cartItemService = cartItemService;
        this.productService = productService;
    }

    @Override
    public Cart createCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        
        Cart savedCart = cartRepository.save(cart);
        
        return savedCart;
    }

    @Override
    public String addCartItem(Long userId, AddItemRequest req) throws ProductException {
        Cart cart = cartRepository.findByUserId(userId);
        Product product = productService.findProductById(req.getProductId());

        CartItem isPresent = cartItemService.isCartItemExist(cart, product, req.getSize(), userId);

        if(isPresent == null){
            CartItem cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setCart(cart);
            cartItem.setUserId(userId);

            int price = req.getQuantity()*product.getDiscountedPrice();
            cartItem.setPrice(price);
            cartItem.setSize(req.getSize());

            CartItem createdCartItem = cartItemService.createCartItem(cartItem);
            cart.getCartItems().add(createdCartItem);

        }
        else{
            isPresent.setQuantity(isPresent.getQuantity() + req.getQuantity());
            isPresent.setPrice(isPresent.getQuantity() * product.getPrice());
            isPresent.setDiscountedPrice(isPresent.getQuantity() * product.getDiscountedPrice());
            cartItemRepository.save(isPresent);
        }

        return "Item Added to Cart";
    }

    @Override
    public Cart findUserCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);

        int totalPrice = 0;
        int totalDiscountedPrice = 0;
        int totalItem = 0;

        for (CartItem ci : cart.getCartItems()){
            totalPrice += ci.getPrice();
            totalDiscountedPrice += ci.getDiscountedPrice();
            totalItem += ci.getQuantity();
        }

        cart.setTotalDiscountedPrice(totalDiscountedPrice);
        cart.setTotalItem(totalItem);
        cart.setTotalPrice(totalPrice);
        cart.setDiscount(totalPrice - totalDiscountedPrice);

        Cart savedCart = cartRepository.save(cart);

        return savedCart;
    }
    
}
