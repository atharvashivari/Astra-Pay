package com.astrapay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent {
    private String transactionId;
    private String fromWallet;
    private String toWallet;
    private BigDecimal amount;
    private String timestamp;
    private String status;
    private String traceId;
    private String type;
}
