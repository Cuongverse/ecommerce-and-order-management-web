package com.it3180hust.service;

import com.it3180hust.exception.CartItemException;
import com.it3180hust.exception.UserException;
import com.it3180hust.model.Cart;
import com.it3180hust.model.CartItem;
import com.it3180hust.model.Product;

public interface CartItemService {
    public CartItem createCartItem(CartItem cartItems);

    public CartItem updateCartItem(Long userId, Long id, CartItem cartItems) throws CartItemException, UserException;

    public CartItem isCartItemExist(Cart cart, Product product, String size, Long userId);

    public void removeCartItem(Long userId, Long cartItemId) throws CartItemException, UserException;

    public CartItem findCartItemById(Long cartItemId) throws CartItemException;
}
