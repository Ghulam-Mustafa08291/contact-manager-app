package com.example.contactmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class PhoneNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;
    private String number;

    @ManyToOne
    @JoinColumn(name = "contact_id")
    @JsonIgnore // Prevent back-reference from being serialized to JSON
    private Contact contact;

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public Contact getContact() { return contact; }
    public void setContact(Contact contact) { this.contact = contact; }
}