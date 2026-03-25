package com.astrapay.controller;

import com.astrapay.model.Account;
import com.astrapay.model.User;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, String>>> searchUsers(@RequestParam String username) {
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(username);
        List<Map<String, String>> result = new ArrayList<>();
        for (User user : users) {
            List<Account> accounts = accountRepository.findByUserId(user.getId().toString());
            if (!accounts.isEmpty()) {
                Map<String, String> map = new HashMap<>();
                map.put("username", user.getUsername());
                map.put("walletAddress", accounts.get(0).getWalletAddress());
                result.add(map);
            }
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(java.security.Principal principal, @RequestBody Map<String, String> updates) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        if (updates.containsKey("phoneNumber")) user.setPhoneNumber(updates.get("phoneNumber"));
        if (updates.containsKey("profileImage")) user.setProfileImage(updates.get("profileImage"));
        
        return ResponseEntity.ok(userRepository.save(user));
    }
}
