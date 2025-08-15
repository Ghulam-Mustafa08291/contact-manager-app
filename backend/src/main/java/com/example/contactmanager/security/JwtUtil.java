package com.example.contactmanager.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Use a long secret key - keep it safe and same every app start
    private static final String SECRET = "replace_this_with_a_very_long_and_secure_secret_key_which_should_be_at_least_256_bits_long";

    // Create Key from secret string bytes using HMAC SHA-256
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    private final long expirationMillis = 24 * 60 * 60 * 1000; // 1 day

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Expose the key for use in JwtFilter
    public Key getKey() {
        return key;
    }
}
