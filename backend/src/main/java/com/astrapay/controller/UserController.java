package com.astrapay.controller;

import com.astrapay.model.User;
import com.astrapay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        if (query.length() < 2) return ResponseEntity.ok(List.of());
        
        List<User> users = userRepository.findByUsernameContainingIgnoreCaseOrPhoneNumberContaining(query, query);
        // Exclude sensitive data
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .map(u -> {
                    u.setPassword(null);
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody User profileUpdate) {
        return userRepository.findByUsername(userDetails.getUsername())
                .map(user -> {
                    if (profileUpdate.getPhoneNumber() != null) {
                        user.setPhoneNumber(profileUpdate.getPhoneNumber());
                    }
                    if (profileUpdate.getProfileImage() != null) {
                        user.setProfileImage(profileUpdate.getProfileImage());
                    }
                    userRepository.save(user);
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
