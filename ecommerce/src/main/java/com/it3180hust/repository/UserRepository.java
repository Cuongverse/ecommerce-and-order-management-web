package com.it3180hust.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.it3180hust.model.User;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User,Long>{
    @Query("SELECT u FROM User u WHERE u.email = :email")
    public User findByEmail(String email);
}
