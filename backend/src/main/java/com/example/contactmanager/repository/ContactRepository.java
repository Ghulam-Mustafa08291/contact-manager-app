package com.example.contactmanager.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.contactmanager.model.Contact;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    // Load child collections in one query
    @EntityGraph(attributePaths = {"emails", "phoneNumbers"})
    List<Contact> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"emails", "phoneNumbers"})
    Page<Contact> findByUserId(Long userId, Pageable pageable);

}