package com.example.contactmanager.repository;

import com.example.contactmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
//    User findByPhoneNumberAndPassword(String phoneNumber, String password);
    User findByEmailAndPassword(String email,String password);

}


