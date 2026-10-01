package com.it3180hust.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.it3180hust.model.User;

public interface UserRepository extends JpaRepository<User,Long>{
    public User findByEmail(String email);
}
