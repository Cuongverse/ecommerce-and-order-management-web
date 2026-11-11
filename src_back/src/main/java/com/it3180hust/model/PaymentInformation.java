package com.it3180hust.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class PaymentInformation {
    @Column(name ="cardholder_name")
    private String cardholderName;

    @Column(name="expiration_date")
    private LocalDate expirationDate;

    @Column(name = "cvv")
    private String cvv; 
}