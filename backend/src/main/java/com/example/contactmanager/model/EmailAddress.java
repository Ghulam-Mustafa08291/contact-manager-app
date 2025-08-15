package com.example.contactmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class EmailAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;
    private String email;

    @ManyToOne
    @JoinColumn(name = "contact_id")
    @JsonIgnore // prevent infinite recursion
    private Contact contact;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Contact getContact() { return contact; }
    public void setContact(Contact contact) { this.contact = contact; }
}