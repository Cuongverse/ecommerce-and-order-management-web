package com.it3180hust.service;

import com.it3180hust.exception.ProductException;
import com.it3180hust.model.Cart;
import com.it3180hust.model.User;
import com.it3180hust.request.AddItemRequest;

public interface CartService {
    public Cart createCart(User user);

    public String addCartItem(Long userId, AddItemRequest req) throws ProductException;

    public Cart findUserCart(Long userId);
}
