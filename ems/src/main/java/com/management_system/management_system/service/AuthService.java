package com.management_system.management_system.service;

import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.LoginRequest;
import com.management_system.management_system.dto.RegisterRequest;
import com.management_system.management_system.entity.Role;
import com.management_system.management_system.entity.User;
import com.management_system.management_system.repository.RoleRepository;
import com.management_system.management_system.repository.UserRepository;
import com.management_system.management_system.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       JwtUtil jwtUtil,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseEntity<ApiResponse> register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse(409, "Email already exists"));
        }

        if (!roleRepository.existsByRoleName(request.getRoleName())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, "Role not found"));
        }

        Optional<Role> role = roleRepository.findByRoleName(request.getRoleName());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role.get());

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(201, "User registered successfully"));
    }

    public ResponseEntity<ApiResponse> login(LoginRequest loginRequest) {

        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, "User not found"));
        }

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.get().getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(401, "Incorrect password"));
        }

        String token = jwtUtil.generateToken(user.get().getEmail());

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse(
                        200,
                        token
                )
        );
    }
}