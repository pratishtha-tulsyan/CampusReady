package com.campusready.campusready.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campusready.campusready.dto.CreateUserRequest;
import com.campusready.campusready.dto.UpdateUserRoleRequest;
import com.campusready.campusready.dto.UserResponseDTO;
import com.campusready.campusready.entity.User;
import com.campusready.campusready.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDTO registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("STUDENT");
        }
        return toResponseDto(userRepository.save(user));
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public UserResponseDTO createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        String role = request.getRole();
        if (role == null || role.isBlank()) {
            role = "STUDENT";
        }

        if (!role.equals("STUDENT") && !role.equals("ADMIN")) {
            throw new IllegalArgumentException("Role must be STUDENT or ADMIN");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .createdAt(LocalDateTime.now())
                .status("ACTIVE")
                .build();

        return toResponseDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.deleteById(id);
    }

    public UserResponseDTO updateUserRole(Long id, UpdateUserRoleRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        String role = request.getRole();
        if (!"STUDENT".equals(role) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("Role must be STUDENT or ADMIN");
        }
        user.setRole(role);
        return toResponseDto(userRepository.save(user));
    }

    private UserResponseDTO toResponseDto(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getStatus());
    }
}
