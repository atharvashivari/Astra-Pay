package com.astrapay.controller;

import com.astrapay.service.PaymentService;
import com.astrapay.service.WalletService;
import com.astrapay.model.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final WalletService walletService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload, Principal principal) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String orderId = paymentService.createOrder(amount, principal.getName());
        return ResponseEntity.ok(Map.of("orderId", orderId));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload, Principal principal) {
        String paymentId = payload.get("razorpay_payment_id");
        String orderId = payload.get("razorpay_order_id");
        String signature = payload.get("razorpay_signature");
        
        boolean isValid = paymentService.verifyPayment(paymentId, orderId, signature, principal.getName());
        if (isValid) {
            return ResponseEntity.ok(Map.of("status", "success"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid signature or verification failed"));
        }
    }

    @PostMapping("/mock-success")
    public ResponseEntity<?> mockSuccess(@RequestBody Map<String, Object> payload, Principal principal) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        Account account = walletService.getAccountByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        walletService.creditFunds(account.getWalletAddress(), amount);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Mock payment successful"));
    }
}
