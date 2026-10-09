package com.it3180hust.controller;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;


import com.it3180hust.exception.CartItemException;
import com.it3180hust.exception.UserException;
import com.it3180hust.model.CartItem;
import com.it3180hust.model.User;
import com.it3180hust.response.ApiResponse;
import com.it3180hust.service.CartItemService;
import com.it3180hust.service.UserService;

@RestController 
@RequestMapping("/api/cart_items")
public class CartItemController {
    @Autowired 
    UserService userService;

    @Autowired 
    CartItemService cartItemService;

    @DeleteMapping("/delete/{cartItemId}")
    ResponseEntity<ApiResponse> deleteCartItem(@PathVariable Long cartItemId,
                                            @RequestHeader("Authorization") String jwt) throws UserException, CartItemException{
        User user = userService.findUserProfileByJwt(jwt);
        cartItemService.removeCartItem(user.getId(), cartItemId);
        ApiResponse res = new ApiResponse();
        res.setMessage("Cart Item Deleted Successfully");
        res.setStatus(true);
        return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
    }

    @GetMapping("/id/{cartItemId}")
    ResponseEntity<CartItem> findCartItemById(@PathVariable Long cartItemId) throws CartItemException{
        CartItem ci = cartItemService.findCartItemById(cartItemId);
        return new ResponseEntity<>(ci, HttpStatus.ACCEPTED);
    }

    @PostMapping("/creates")
    ResponseEntity<ApiResponse> createCartItemHandler(@RequestBody CartItem cartItem){
        cartItemService.createCartItem(cartItem);
        ApiResponse res = new ApiResponse();
        res.setStatus(true);
        res.setMessage("Cart Item Created Successfully");
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @PutMapping("/update/{cartItemId}")
    ResponseEntity<CartItem> updateCartItemHandler(@RequestBody CartItem cartItem,
                                                    @PathVariable Long cartItemId,
                                                    @RequestHeader("Authorization") String jwt) throws UserException, CartItemException{
        User user = userService.findUserProfileByJwt(jwt);
        CartItem updatedCartItem = cartItemService.updateCartItem(user.getId(), cartItemId, cartItem);
        return new ResponseEntity<>(updatedCartItem, HttpStatus.OK);
    }
}
