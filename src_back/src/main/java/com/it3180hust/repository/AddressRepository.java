package com.it3180hust.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.it3180hust.model.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {
}

