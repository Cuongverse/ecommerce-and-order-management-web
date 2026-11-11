package com.it3180hust.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.it3180hust.exception.UserException;
import com.it3180hust.model.User;


public interface UserService {
    // not yet implemented
    public User findUserById(Long userId) throws UserException;

    public User findUserProfileByJwt(String jwt) throws UserException;

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;

}
