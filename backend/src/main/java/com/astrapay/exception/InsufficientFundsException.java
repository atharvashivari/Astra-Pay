package com.astrapay.exception;

/**
 * Thrown when an account has insufficient funds to complete a transfer.
 */
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
}
