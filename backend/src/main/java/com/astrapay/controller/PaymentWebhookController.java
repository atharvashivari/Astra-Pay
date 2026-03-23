package com.astrapay.controller;

import com.astrapay.service.WalletService;
import com.astrapay.model.Account;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    @Value("${razorpay.key.secret}")
    private String webhookSecret;

    private final WalletService walletService;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isValid) {
                log.warn("Invalid Razorpay Webhook Signature");
                return ResponseEntity.badRequest().body("Invalid signature");
            }

            JSONObject jsonPayload = new JSONObject(payload);
            String event = jsonPayload.getString("event");

            if ("payment.captured".equals(event)) {
                JSONObject paymentEntity = jsonPayload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                int amountPaise = paymentEntity.getInt("amount");
                BigDecimal amount = new BigDecimal(amountPaise).divide(new BigDecimal("100"));
                
                JSONObject notes = paymentEntity.getJSONObject("notes");
                String username = notes.getString("username");

                log.info("Payment captured for user {}. Crediting {} INR", username, amount);
                Account account = walletService.getAccountByUsername(username)
                        .orElseThrow(() -> new RuntimeException("Account not found for user: " + username));
                walletService.creditFunds(account.getWalletAddress(), amount);
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            return ResponseEntity.internalServerError().body("Error");
        }
    }
}
