package com.it3180hust.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity 
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name="first_name")
    private String firstName;

    @Column(name="last_name")
    private String lastName;

    @Column(name="street_address")
    private String streetAddress;

    @Column(name="province")
    private String province;  
    
    @Column(name="city")
    private String city;

    @Column(name="zip_code")
    private String zipCode;

    // many addresses can be mapped to one user
    // but one address can have only one user
    @ManyToOne
    @JoinColumn(name="user_id")
    @JsonIgnore 
    private User user;

    private String mobile;

    Address(Long id, String firstName, String lastName, String streetAddress,
        String province, String city, String zipCode, User user, String mobile){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.province = province;
        this.streetAddress = streetAddress;
        this.city = city;
        this.zipCode = zipCode;
        this.user = user;
        this.mobile = mobile;
    }

    // getters
    public Long getId(){
        return id;
    }

    public String getFirstName(){
        return firstName;
    }

    public String getLastName(){
        return lastName;
    }

    public String getStreetAddress(){
        return streetAddress;
    }

    public String getProvince(){
        return province;
    }

    public String getCity(){
        return city;
    }

    public String getZipCode(){
        return zipCode;
    }

    public User getUser(){
        return user;
    }

    public String mobile(){
        return mobile;
    }

    // setters
    public void setId(Long id){
        this.id = id;
    }

    public void setFirstName(String firstName){
        this.firstName = firstName;
    }

    public void setLastName(String lastName){
        this.lastName = lastName;
    }

    public void setStreetAddress(String streetAddress){
        this.streetAddress = streetAddress;
    }

    public void setProvince(String province){
        this.province = province;
    }

    public void setCity(String city){
        this.city = city;
    }

    public void setZipCode(String zipCode){
        this.zipCode = zipCode;
    }

    public void setUser(User user){
        this.user = user;
    }

    public void mobile(String mobile){
        this.mobile = mobile;
    }
}
