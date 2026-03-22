package com.astrapay.controller;

import com.astrapay.dto.TransferRequest;
import com.astrapay.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for wallet operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    /**
     * Executes a fund transfer between two wallets.
     *
     * @param request the transfer details
     * @return a success response
     */
    @PostMapping("/transfer")
    public ResponseEntity<Map<String, String>> transferFunds(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("X-Idempotency-Key") String idempotencyKey) {
        log.info("Received transfer request from '{}' to '{}' for amount {} with key '{}'",
                request.getFromWallet(), request.getToWallet(), request.getAmount(), idempotencyKey);

        com.astrapay.model.Transaction tx = walletService.transferFunds(
                request.getFromWallet(),
                request.getToWallet(),
                request.getAmount(),
                idempotencyKey);

        return ResponseEntity.ok(Map.of(
                "message", "Transfer successful",
                "idempotencyKey", idempotencyKey,
                "transactionId", tx.getId().toString()
        ));
    }

    /**
     * Retrieves the balance of the authenticated user's wallet.
     *
     * @param principal the authenticated user
     * @return the balance details
     */
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(java.security.Principal principal) {
        String username = principal.getName();
        return walletService.getAccountByUsername(username)
                .map(account -> ResponseEntity.ok(Map.<String, Object>of(
                        "walletAddress", account.getWalletAddress(),
                        "balance", account.getBalance()
                )))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Wallet not found", "balance", 0)));
    }

    /**
     * Retrieves recent transactions for the authenticated user's wallet.
     */
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(java.security.Principal principal) {
        String username = principal.getName();
        return ResponseEntity.ok(walletService.getTransactionsByUsername(username));
    }

    /**
     * Retrieves a single transaction by ID.
     */
    @GetMapping("/transactions/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable java.util.UUID id) {
        return walletService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
