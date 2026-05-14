package com.campusready.campusready.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campusready.campusready.dto.LoginRequest;
import com.campusready.campusready.dto.LoginResponse;
import com.campusready.campusready.entity.User;
import com.campusready.campusready.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return new LoginResponse(null, "User not found", null, null);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse(null, "Invalid password", null, null);
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, "Login successful", user.getEmail(), user.getRole());
    }
}