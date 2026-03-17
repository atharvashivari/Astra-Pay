package com.astrapay.controller;

import com.astrapay.dto.TransferRequest;
import com.astrapay.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller for wallet operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/wallets")
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
    public ResponseEntity<Map<String, String>> transferFunds(@Valid @RequestBody TransferRequest request) {
        log.info("Received transfer request from '{}' to '{}' for amount {}",
                request.getFromWallet(), request.getToWallet(), request.getAmount());

        walletService.transferFunds(
                request.getFromWallet(),
                request.getToWallet(),
                request.getAmount(),
                request.getIdempotencyKey());

        return ResponseEntity.ok(Map.of(
                "message", "Transfer successful",
                "idempotencyKey", request.getIdempotencyKey()
        ));
    }
}
