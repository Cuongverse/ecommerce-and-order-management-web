package com.it3180hust.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.it3180hust.config.JwtProvider;
import com.it3180hust.exception.UserException;
import com.it3180hust.model.User;
import com.it3180hust.repository.UserRepository;

@Service 
public class UserServiceImplementation implements UserService{

    private final JwtProvider jwtProvider;
    private UserRepository userRepository;

    public UserServiceImplementation(UserRepository userRepository, JwtProvider jwtProvider){
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    @Override
    public User findUserById(Long userId) throws UserException {
        Optional<User> user = userRepository.findById(userId);

        if (user.isPresent()){
            return user.get();
        }
        throw new UserException("User Not Found With ID - " + userId);
    }

    @Override
    public User findUserProfileByJwt(String jwt) throws UserException {
        String email = jwtProvider.getEmailFromToken(jwt);

        User user = userRepository.findByEmail(email);

        if (user == null){
            throw new UserException("User Not Found With Email " + email);
        }
        return null;
    }
    
}
