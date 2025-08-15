package com.example.contactmanager.controller;

import com.example.contactmanager.model.Contact;
import com.example.contactmanager.model.User;
import com.example.contactmanager.repository.ContactRepository;
import com.example.contactmanager.repository.UserRepository;
import com.example.contactmanager.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, ContactRepository contactRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        System.out.println("in /api/login,email entered:" + email);
        System.out.println("in /api/login,password entered:" + password);
        System.out.println("in /api/login,reached till here");

        User user = userRepository.findByEmailAndPassword(email, password);
        if (user != null) {
            System.out.println("found users:" + user);
            String token = jwtUtil.generateToken(user.getEmail());
            System.out.println("in login endpoint,token:"+token);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", user
            ));
        } else {
            System.out.println("in /api/login,couldnt find the user lol");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/contacts")
    public List<Contact> getContacts(@AuthenticationPrincipal String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return List.of(); // or throw 401/404 depending on your preference
        }
        return contactRepository.findByUserId(user.getId());
    }


    @GetMapping("/by-email")
    public User getUserByEmail(@RequestParam String email) {
        System.out.println("Looking up user with email: " + email);
        return userRepository.findByEmail(email);
    }

    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id);
    }

    // Add this method to your existing UserController.java

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal String email) {
        try {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving user profile: " + e.getMessage());
        }
    }
}