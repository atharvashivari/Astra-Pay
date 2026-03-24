package com.astrapay.controller;
 
 import com.astrapay.service.WalletService;
 import lombok.RequiredArgsConstructor;
 import org.springframework.http.ResponseEntity;
 import org.springframework.security.core.Authentication;
 import org.springframework.web.bind.annotation.GetMapping;
 import org.springframework.web.bind.annotation.RequestMapping;
 import org.springframework.web.bind.annotation.RestController;
 
 import java.math.BigDecimal;
 import java.util.Map;
 
 @RestController
 @RequestMapping("/api/v1/wallet")
 @RequiredArgsConstructor
 public class WalletStatsController {
 
     private final WalletService walletService;
 
     @GetMapping("/stats")
     public ResponseEntity<Map<String, BigDecimal>> getMonthlyStats(Authentication authentication) {
         return ResponseEntity.ok(walletService.getMonthlyStats(authentication.getName()));
     }
 }
