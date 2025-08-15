package com.example.contactmanager.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip JWT processing for login and register endpoints
        String requestPath = request.getRequestURI();
        if (requestPath.equals("/api/users/login") || requestPath.equals("/api/users/register")) {
            System.out.println("Skipping JWT filter for: " + requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        System.out.println("=== JWT Filter Debug ===");
        System.out.println("Request URL: " + request.getRequestURL());
        System.out.println("Auth Header: " + authHeader);

        String jwtToken = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
            System.out.println("JWT Token extracted: " + jwtToken.substring(0, Math.min(20, jwtToken.length())) + "...");
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(jwtUtil.getKey())  // Use key from JwtUtil
                        .build()
                        .parseClaimsJws(jwtToken)
                        .getBody();

                email = claims.getSubject();
                System.out.println("Email extracted from token: " + email);

            } catch (Exception e) {
                System.out.println("Invalid JWT token: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("No Bearer token found in Authorization header");
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            System.out.println("Authentication set for user: " + email);
        } else {
            System.out.println("No authentication set. Email: " + email);
        }

        filterChain.doFilter(request, response);
    }
}