package com.example.contactmanager.repository;

import com.example.contactmanager.model.EmailAddress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailAddressRepository extends JpaRepository<EmailAddress, Long> {

}
