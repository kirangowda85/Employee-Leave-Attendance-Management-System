package com.management_system.management_system.security;

import com.management_system.management_system.entity.User;
import com.management_system.management_system.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.Optional;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {


        final String authHeader = request.getHeader("Authorization");
        final String jwt;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        jwt = authHeader.substring(7);
        final String userEmail;

        userEmail = jwtUtil.extractUsername(jwt);
        if (userEmail != null) {

            Optional<User> user = userRepository.findByEmail(userEmail);

            if (user.isPresent()) {
                if (jwtUtil.isTokenValid(jwt, user.get().getEmail())) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    user.get(),
                                    null, List.of(
                                            new SimpleGrantedAuthority(
                                                    "ROLE_" + user.get().getRole().getRoleName()
                                            )
                                    )
                            );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }


            }
        }
        filterChain.doFilter(request, response);

    }
}