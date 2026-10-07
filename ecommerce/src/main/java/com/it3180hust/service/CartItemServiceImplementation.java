package com.it3180hust.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.it3180hust.exception.CartItemException;
import com.it3180hust.exception.UserException;
import com.it3180hust.model.Cart;
import com.it3180hust.model.CartItem;
import com.it3180hust.model.Product;
import com.it3180hust.model.User;
import com.it3180hust.repository.CartItemRepository;
import com.it3180hust.repository.CartRepository;

@Service 
public class CartItemServiceImplementation implements CartItemService {

    private CartItemRepository cartItemRepository;
    private UserService userService;
    private CartRepository cartRepository;
    

    public CartItemServiceImplementation(CartItemRepository cartItemRepository,
            UserService userService, CartRepository cartRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userService = userService;
        this.cartRepository = cartRepository;
    }

    @Override
    public CartItem createCartItem(CartItem cartItems) {
        cartItems.setQuantity(1);
        cartItems.setPrice(cartItems.getProduct().getPrice()*cartItems.getQuantity());
        cartItems.setDiscountedPrice(cartItems.getProduct().getDiscountedPrice()*cartItems.getQuantity());

        CartItem createdCartItem = cartItemRepository.save(cartItems);
        return createdCartItem;
    }

    @Override
    public CartItem updateCartItem(Long userId, Long id, CartItem cartItems) throws CartItemException, UserException {
        CartItem item = findCartItemById(id);
        User user = userService.findUserById(userId);

        if (user.getId().equals(userId)){
            item.setQuantity(item.getQuantity());
            item.setPrice(item.getQuantity()*item.getProduct().getPrice());
            item.setDiscountedPrice(item.getProduct().getDiscountedPrice()*item.getQuantity());
        }

        CartItem createdCartItem = cartItemRepository.save(item);
        return createdCartItem;
    }

    @Override
    public CartItem isCartItemExist(Cart cart, Product product, String size, Long userId) {
        CartItem cartItem = cartItemRepository.isCartItemExist(cart, product, size, userId);
        return cartItem;
    }

    @Override
    public void removeCartItem(Long userId, Long cartItemId) throws CartItemException, UserException {
        CartItem cartItem = findCartItemById(cartItemId);

        User user = userService.findUserById(cartItem.getUserId());

        User reqUser = userService.findUserById(userId);

        if (user.getId().equals(reqUser.getId())){
            cartItemRepository.deleteById(cartItemId);
        }
        throw new UserException("Removing Error");
    }

    @Override
    public CartItem findCartItemById(Long cartItemId) throws CartItemException {
        Optional<CartItem> ci = cartItemRepository.findById(cartItemId);

        if (ci.isPresent()){
            return ci.get();
        }
    
        throw new CartItemException("Cart Item Not Found With ID - " + cartItemId);
    }
    
}
