package com.example.contactmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String title;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore // Optional: avoid sending the whole user with each contact
    private User user;

    // Use Set to avoid bag semantics
    @OneToMany(mappedBy = "contact", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    private Set<EmailAddress> emails = new LinkedHashSet<>();

    // Also Set here
    @OneToMany(mappedBy = "contact", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    private Set<PhoneNumber> phoneNumbers = new LinkedHashSet<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Set<EmailAddress> getEmails() { return emails; }
    public void setEmails(Set<EmailAddress> emails) { this.emails = emails; }

    public Set<PhoneNumber> getPhoneNumbers() { return phoneNumbers; }
    public void setPhoneNumbers(Set<PhoneNumber> phoneNumbers) { this.phoneNumbers = phoneNumbers; }

    // Convenience methods to keep both sides in sync
    public void addEmail(EmailAddress email) {
        emails.add(email);
        email.setContact(this);
    }

    public void removeEmail(EmailAddress email) {
        emails.remove(email);
        email.setContact(null);
    }

    public void addPhoneNumber(PhoneNumber phone) {
        phoneNumbers.add(phone);
        phone.setContact(this);
    }

    public void removePhoneNumber(PhoneNumber phone) {
        phoneNumbers.remove(phone);
        phone.setContact(null);
    }
}