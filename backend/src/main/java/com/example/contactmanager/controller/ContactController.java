package com.example.contactmanager.controller;

import com.example.contactmanager.model.Contact;
import com.example.contactmanager.model.User;
import com.example.contactmanager.model.EmailAddress;
import com.example.contactmanager.model.PhoneNumber;
import com.example.contactmanager.repository.ContactRepository;
import com.example.contactmanager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    public ContactController(ContactRepository contactRepository, UserRepository userRepository) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createContact(@RequestBody Map<String, Object> contactData,
                                           @AuthenticationPrincipal String email) {
        try {
            // Get the authenticated user
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            // Create new contact
            Contact contact = new Contact();
            contact.setFirstName((String) contactData.get("firstName"));
            contact.setLastName((String) contactData.get("lastName"));
            contact.setTitle((String) contactData.get("title"));
            contact.setUser(user);

            // Handle emails
            @SuppressWarnings("unchecked")
            List<Map<String, String>> emailsData = (List<Map<String, String>>) contactData.get("emails");
            if (emailsData != null) {
                for (Map<String, String> emailData : emailsData) {
                    String emailValue = emailData.get("email");
                    if (emailValue != null && !emailValue.trim().isEmpty()) {
                        EmailAddress emailAddress = new EmailAddress();
                        emailAddress.setLabel(emailData.get("label"));
                        emailAddress.setEmail(emailValue.trim());
                        emailAddress.setContact(contact);
                        contact.getEmails().add(emailAddress);
                    }
                }
            }

            // Handle phone numbers
            @SuppressWarnings("unchecked")
            List<Map<String, String>> phoneNumbersData = (List<Map<String, String>>) contactData.get("phoneNumbers");
            if (phoneNumbersData != null) {
                for (Map<String, String> phoneData : phoneNumbersData) {
                    String phoneValue = phoneData.get("number");
                    if (phoneValue != null && !phoneValue.trim().isEmpty()) {
                        PhoneNumber phoneNumber = new PhoneNumber();
                        phoneNumber.setLabel(phoneData.get("label"));
                        phoneNumber.setNumber(phoneValue.trim());
                        phoneNumber.setContact(contact);
                        contact.getPhoneNumbers().add(phoneNumber);
                    }
                }
            }

            // Save the contact (this will cascade and save emails and phone numbers too)
            Contact savedContact = contactRepository.save(contact);

            return ResponseEntity.ok(savedContact);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating contact: " + e.getMessage());
        }
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<?> getContact(@PathVariable Long contactId,
                                        @AuthenticationPrincipal String email) {
        try {
            // Get the authenticated user
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            // Find the contact
            Optional<Contact> contactOpt = contactRepository.findById(contactId);
            if (contactOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Contact not found");
            }

            Contact contact = contactOpt.get();

            // Security check: Make sure the contact belongs to the authenticated user
            if (!contact.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only access your own contacts");
            }

            return ResponseEntity.ok(contact);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving contact: " + e.getMessage());
        }
    }

    @PutMapping("/{contactId}")
    public ResponseEntity<?> updateContact(@PathVariable Long contactId,
                                           @RequestBody Map<String, Object> contactData,
                                           @AuthenticationPrincipal String email) {
        try {
            // Get the authenticated user
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            // Find the contact
            Optional<Contact> contactOpt = contactRepository.findById(contactId);
            if (contactOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Contact not found");
            }

            Contact contact = contactOpt.get();

            // Security check: Make sure the contact belongs to the authenticated user
            if (!contact.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only update your own contacts");
            }

            // Update basic fields
            contact.setFirstName((String) contactData.get("firstName"));
            contact.setLastName((String) contactData.get("lastName"));
            contact.setTitle((String) contactData.get("title"));

            // Clear existing emails and phone numbers (orphanRemoval will delete them)
            contact.getEmails().clear();
            contact.getPhoneNumbers().clear();

            // Handle emails
            @SuppressWarnings("unchecked")
            List<Map<String, String>> emailsData = (List<Map<String, String>>) contactData.get("emails");
            if (emailsData != null) {
                for (Map<String, String> emailData : emailsData) {
                    String emailValue = emailData.get("email");
                    if (emailValue != null && !emailValue.trim().isEmpty()) {
                        EmailAddress emailAddress = new EmailAddress();
                        emailAddress.setLabel(emailData.get("label"));
                        emailAddress.setEmail(emailValue.trim());
                        emailAddress.setContact(contact);
                        contact.getEmails().add(emailAddress);
                    }
                }
            }

            // Handle phone numbers
            @SuppressWarnings("unchecked")
            List<Map<String, String>> phoneNumbersData = (List<Map<String, String>>) contactData.get("phoneNumbers");
            if (phoneNumbersData != null) {
                for (Map<String, String> phoneData : phoneNumbersData) {
                    String phoneValue = phoneData.get("number");
                    if (phoneValue != null && !phoneValue.trim().isEmpty()) {
                        PhoneNumber phoneNumber = new PhoneNumber();
                        phoneNumber.setLabel(phoneData.get("label"));
                        phoneNumber.setNumber(phoneValue.trim());
                        phoneNumber.setContact(contact);
                        contact.getPhoneNumbers().add(phoneNumber);
                    }
                }
            }

            // Save the updated contact
            Contact updatedContact = contactRepository.save(contact);

            return ResponseEntity.ok(updatedContact);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating contact: " + e.getMessage());
        }
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<?> deleteContact(@PathVariable Long contactId,
                                           @AuthenticationPrincipal String email) {
        try {
            // Get the authenticated user
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            // Find the contact
            Optional<Contact> contactOpt = contactRepository.findById(contactId);
            if (contactOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Contact not found");
            }

            Contact contact = contactOpt.get();

            // Security check: Make sure the contact belongs to the authenticated user
            if (!contact.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only delete your own contacts");
            }

            // Delete the contact (cascade will delete emails and phone numbers too)
            contactRepository.delete(contact);

            return ResponseEntity.ok().body("Contact deleted successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting contact: " + e.getMessage());
        }
    }
}