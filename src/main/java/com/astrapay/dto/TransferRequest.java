package com.astrapay.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Data transfer object for a funds transfer request.
 */
@Data
public class TransferRequest {

    @NotBlank(message = "Sender wallet address is required")
    private String fromWallet;

    @NotBlank(message = "Recipient wallet address is required")
    private String toWallet;

    @NotNull(message = "Transfer amount is required")
    @Positive(message = "Transfer amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey;
}
