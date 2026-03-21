package com.astrapay.service;

import com.astrapay.config.JwtUtils;
import com.astrapay.dto.AuthResponse;
import com.astrapay.dto.LoginRequest;
import com.astrapay.dto.RegisterRequest;
import com.astrapay.model.Account;
import com.astrapay.model.User;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of("ROLE_USER"));
        
        User savedUser = userRepository.save(user);

        // Create initial account
        Account account = new Account();
        account.setUserId(savedUser.getId().toString());
        account.setBalance(new BigDecimal("10000.00"));
        account.setCurrency("INR");
        account.setStatus(Account.Status.ACTIVE);
        account.setWalletAddress(generateUniqueWalletAddress());
        
        accountRepository.save(account);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
        
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", savedUser.getId().toString());
        
        String token = jwtUtils.generateToken(extraClaims, userDetails);

        return AuthResponse.builder()
                .token(token)
                .username(savedUser.getUsername())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getUsername()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId().toString());
        
        String token = jwtUtils.generateToken(extraClaims, userDetails);

        return AuthResponse.builder()
                .token(token)
                .username(request.getUsername())
                .build();
    }

    private String generateUniqueWalletAddress() {
        return UUID.randomUUID().toString();
    }

    public Map<String, Object> getMe(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        Account account = accountRepository.findByUserId(user.getId().toString())
                .stream().findFirst().orElseThrow(() -> new RuntimeException("Account not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("walletAddress", account.getWalletAddress());
        return response;
    }
}
