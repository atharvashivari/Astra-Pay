package com.astrapay.controller;

import com.astrapay.dto.TransferRequest;
import com.astrapay.service.WalletService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * REST controller for wallet operations.
 */
@Tag(name = "Wallet", description = "Endpoints for wallet balance, transfers, and transaction history")
@SecurityRequirement(name = "bearerAuth")
@Slf4j
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Executes a fund transfer between two wallets.
     *
     * @param request the transfer details
     * @return a success response
     */
    @Operation(summary = "Transfer funds", description = "Sends money from your wallet to another Astra-Pay wallet")
    @ApiResponse(responseCode = "200", description = "Transfer successful")
    @ApiResponse(responseCode = "400", description = "Insufficient funds or invalid recipient")
    @ApiResponse(responseCode = "429", description = "Too many requests - rate limit exceeded")
    @PostMapping("/transfer")
    public ResponseEntity<Map<String, String>> transferFunds(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("X-Idempotency-Key") String idempotencyKey,
            java.security.Principal principal) {
        
        String username = principal.getName();
        Bucket bucket = buckets.computeIfAbsent(username, k -> createNewBucket());

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded for user '{}' on /transfer", username);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("X-Rate-Limit-Retry-After-Seconds", "60")
                    .body(Map.of("error", "Rate limit exceeded. Please wait 60 seconds."));
        }

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
    @Operation(summary = "Get wallet balance", description = "Returns the balance and wallet address of the authenticated user")
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
    @Operation(summary = "Get transaction history", description = "Returns a list of all transactions involving the user's wallet")
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(java.security.Principal principal) {
        String username = principal.getName();
        return ResponseEntity.ok(walletService.getTransactionsByUsername(username));
    }

    /**
     * Retrieves a single transaction by ID.
     */
    @Operation(summary = "Get transaction by ID", description = "Retrieves detailed information about a specific transaction")
    @GetMapping("/transactions/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable java.util.UUID id) {
        return walletService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Generates a QR code for the authenticated user's wallet address.
     */
    @Operation(summary = "Generate wallet QR code", description = "Generates a 250x250 QR code containing the user's wallet address as a Base64 string")
    @ApiResponse(responseCode = "200", description = "QR code generated successfully")
    @GetMapping("/qr")
    public ResponseEntity<Map<String, String>> getWalletQr(java.security.Principal principal) {
        String username = principal.getName();
        return walletService.getAccountByUsername(username)
                .map(account -> {
                    try {
                        String walletAddress = account.getWalletAddress();
                        QRCodeWriter qrCodeWriter = new QRCodeWriter();
                        BitMatrix bitMatrix = qrCodeWriter.encode(walletAddress, BarcodeFormat.QR_CODE, 250, 250);

                        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
                        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
                        byte[] pngData = pngOutputStream.toByteArray();
                        String base64Image = Base64.getEncoder().encodeToString(pngData);

                        return ResponseEntity.ok(Map.of(
                                "qrCode", "data:image/png;base64," + base64Image,
                                "walletAddress", walletAddress
                        ));
                    } catch (Exception e) {
                        log.error("Failed to generate QR code for user {}: {}", username, e.getMessage());
                        return ResponseEntity.internalServerError().<Map<String, String>>build();
                    }
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
