package com.it3180hust.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.it3180hust.response.AuthResponse;

@RestControllerAdvice 
public class GlobalExceptionHandler {
    // xử lí lỗi liên quan tới UserException
    @ExceptionHandler(UserException.class)
    public ResponseEntity<AuthResponse> userExceptionHandler(UserException e){
        AuthResponse response = new AuthResponse();
        response.setMessage(e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(CartItemException.class)
    public ResponseEntity<AuthResponse> cartItemExceptionHandler(CartItemException e){
        AuthResponse response = new AuthResponse();
        response.setMessage(e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(OrderException.class)
    public ResponseEntity<AuthResponse> orderExceptionHandler(OrderException e){
        AuthResponse response = new AuthResponse();
        response.setMessage(e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ProductException.class)
    public ResponseEntity<AuthResponse> ProductExceptionHandler(ProductException e){
        AuthResponse response = new AuthResponse();
        response.setMessage(e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AuthResponse> ValidationExceptionHandler(MethodArgumentNotValidException e){
        AuthResponse response = new AuthResponse();
        // lấy message báo lỗi mà admin viết sẵn, tránh lấy error log của hệ thống
        String erorMsg = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        response.setMessage(erorMsg);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
