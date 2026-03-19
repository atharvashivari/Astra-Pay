package com.astrapay.exception;

/**
 * Thrown when a specified wallet address cannot be found in the system.
 */
public class AccountNotFoundException extends RuntimeException {
    public AccountNotFoundException(String message) {
        super(message);
    }
}
