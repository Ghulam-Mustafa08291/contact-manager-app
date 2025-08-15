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
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // Check if email already exists
            User existingUser = userRepository.findByEmail(user.getEmail().toLowerCase());
            if (existingUser != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Email already exists");
            }

            // Validate input
            if (user.getName() == null || user.getName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Name is required");
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Email is required");
            }

            if (user.getPassword() == null || user.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Password must be at least 6 characters long");
            }

            // Clean up data
            user.setName(user.getName().trim());
            user.setEmail(user.getEmail().trim().toLowerCase());
        
            User savedUser = userRepository.save(user);
            System.out.println("New user registered: " + savedUser.getEmail());
        
            return ResponseEntity.ok(savedUser);
        
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
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

    // for changing name of uesr
    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal String email, 
                                         @RequestBody Map<String, String> updateData) {
        try {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            String newName = updateData.get("name");
            if (newName == null || newName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Name cannot be empty");
            }

            // Update the user's name
            user.setName(newName.trim());
            User updatedUser = userRepository.save(user);

            System.out.println("Profile updated for user: " + email + ", new name: " + newName);
            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating profile: " + e.getMessage());
        }
    }


    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal String email, 
                                          @RequestBody Map<String, String> passwordData) {
        try {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            // Validate input
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Current password and new password are required");
            }

            // Check if current password is correct
            if (!user.getPassword().equals(currentPassword)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Current password is incorrect");
            }

            // Validate new password length
            if (newPassword.length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("New password must be at least 6 characters long");
            }

            // Update the password
            user.setPassword(newPassword);
            userRepository.save(user);

            System.out.println("Password changed successfully for user: " + email);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error changing password: " + e.getMessage());
        }
    }
}