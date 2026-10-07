package com.it3180hust.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3180hust.config.JwtProvider;
import com.it3180hust.exception.UserException;
import com.it3180hust.model.User;
import com.it3180hust.repository.UserRepository;
import com.it3180hust.request.LoginRequest;
import com.it3180hust.response.AuthResponse;
import com.it3180hust.service.CustomUserServiceImplementation;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;


@RestController 
@RequestMapping("/auth")
public class AuthController {

    private UserRepository userRepository;
    private JwtProvider jwtProvider;
    private PasswordEncoder passwordEncoder;
    private CustomUserServiceImplementation customUserService;

    public AuthController(UserRepository userRepository, 
        CustomUserServiceImplementation customUserService,
        PasswordEncoder passwordEncoder,
        JwtProvider jwtProvider){
        this.userRepository = userRepository;
        this.customUserService = customUserService;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(@RequestBody User user) throws UserException{
        String email = user.getEmail();
        String password = user.getPassword();
        String firstName = user.getFirstName();
        String lastName = user.getLastName();

        User isEmailExist = userRepository.findByEmail(email);

        if(isEmailExist != null){
            throw new UserException("Email is already used with another account.");
        }

        User createdUser = new User();
        createdUser.setPassword(passwordEncoder.encode(password));
        createdUser.setEmail(email);
        createdUser.setFirstName(firstName);
        createdUser.setLastName(lastName);

        User savedUser = userRepository.save(createdUser);

        Authentication authentication = new UsernamePasswordAuthenticationToken(savedUser.getEmail(), savedUser.getPassword());
        SecurityContextHolder.getContext().setAuthentication((authentication));

        String token = jwtProvider.generateToken(authentication);

        AuthResponse authResponse = new AuthResponse(token, "Signed Up Successfully");
        
        return new ResponseEntity<AuthResponse>(authResponse,HttpStatus.CREATED);
    }

    @PostMapping("/login")    
    public ResponseEntity<AuthResponse> loginUserHandler(@RequestBody LoginRequest loginRequest){
        String username = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Authentication authentication = authenticate(username,password);

        String token = jwtProvider.generateToken(authentication);

        AuthResponse authResponse = new AuthResponse(token, "Logged in Successfully");
        
        return new ResponseEntity<AuthResponse>(authResponse,HttpStatus.CREATED);
    }

    // the method that actually authenticates requests
    private Authentication authenticate(String username, String password){
        UserDetails userDetails = customUserService.loadUserByUsername(username);
        if (userDetails == null){
            throw new BadCredentialsException("Invalid Username.");
        }

        if(!passwordEncoder.matches(password, userDetails.getPassword())){
            throw new BadCredentialsException("Invalid Password.");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @ExceptionHandler(BadCredentialsException.class) // báo spring hàm này xử lí exception
    // liên quan tới BadCredentials
    public ResponseEntity<AuthResponse> handleBadCredentialsException(BadCredentialsException e){
        AuthResponse response = new AuthResponse();
        response.setMessage(e.getMessage()); // trả về 'invalid password' hoặc 'invalid username'
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED); // trả về '401 Unauthorized'
    }
}
