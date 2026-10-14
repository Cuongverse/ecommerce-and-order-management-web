package com.it3180hust.request;

import jakarta.validation.constraints.Email;

public class LoginRequest {
    @Email 
    private String email;
    private String password;

    public LoginRequest(){
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String pasword) {
        this.password = pasword;
    }

}
