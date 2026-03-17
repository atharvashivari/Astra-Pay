package com.astrapay.service;

import com.astrapay.exception.DuplicateTransactionException;
import com.astrapay.model.Account;
import com.astrapay.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;

/**
 * Core ledger service responsible for atomic fund transfers between Astra-Pay wallets.
 *
 * <h3>Concurrency strategy</h3>
 * <ol>
 *   <li><b>Idempotency</b>  – Redis key-check before any DB work; 24-hour TTL stored after success.</li>
 *   <li><b>Pessimistic locking</b> – Both account rows are locked
 *       with {@code PESSIMISTIC_WRITE} before mutation.</li>
 *   <li><b>Deadlock prevention</b> – Locks are always acquired in a deterministic order
 *       (alphabetically by walletAddress) so two concurrent inverse transfers
 *       (A→B and B→A) cannot deadlock each other.</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final AccountRepository accountRepository;
    private final StringRedisTemplate stringRedisTemplate;

    /**
     * Transfers {@code amount} from {@code fromWallet} to {@code toWallet} atomically.
     *
     * @param fromWallet     wallet address of the sender
     * @param toWallet       wallet address of the recipient
     * @param amount         positive amount to transfer
     * @param idempotencyKey unique client-supplied key to prevent duplicate submissions
     * @throws DuplicateTransactionException if the idempotency key already exists in Redis
     * @throws IllegalArgumentException      if an account is not found, is not ACTIVE,
     *                                       or the sender has insufficient funds
     */
    @Transactional
    public void transferFunds(String fromWallet,
                              String toWallet,
                              BigDecimal amount,
                              String idempotencyKey) {

        // ── Step 1: Idempotency guard ──────────────────────────────────────────────
        Boolean alreadyProcessed = stringRedisTemplate.hasKey(idempotencyKey);
        if (Boolean.TRUE.equals(alreadyProcessed)) {
            log.warn("Duplicate transaction attempt detected for idempotency key: {}", idempotencyKey);
            throw new DuplicateTransactionException(
                    "Transaction with idempotency key '" + idempotencyKey + "' has already been processed.");
        }

        // ── Step 2: Acquire locks in a consistent order (deadlock prevention) ─────
        // Always lock the lexicographically-smaller address first.
        String firstLock  = fromWallet.compareTo(toWallet) <= 0 ? fromWallet : toWallet;
        String secondLock = fromWallet.compareTo(toWallet) <= 0 ? toWallet   : fromWallet;

        Account firstAccount = accountRepository.findWithLockByWalletAddress(firstLock)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Account not found for wallet address: " + firstLock));

        Account secondAccount = accountRepository.findWithLockByWalletAddress(secondLock)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Account not found for wallet address: " + secondLock));

        // Restore canonical from/to references after lock acquisition
        Account fromAccount = firstLock.equals(fromWallet) ? firstAccount : secondAccount;
        Account toAccount   = firstLock.equals(toWallet)   ? firstAccount : secondAccount;

        // ── Step 3: Validate account status ───────────────────────────────────────
        if (fromAccount.getStatus() != Account.Status.ACTIVE) {
            throw new IllegalArgumentException(
                    "Sender account '" + fromWallet + "' is not active (current status: "
                    + fromAccount.getStatus() + ").");
        }
        if (toAccount.getStatus() != Account.Status.ACTIVE) {
            throw new IllegalArgumentException(
                    "Recipient account '" + toWallet + "' is not active (current status: "
                    + toAccount.getStatus() + ").");
        }

        // ── Step 4: Validate sufficient funds ─────────────────────────────────────
        if (fromAccount.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException(
                    "Insufficient funds in wallet '" + fromWallet + "'. "
                    + "Available: " + fromAccount.getBalance() + ", "
                    + "Requested: " + amount + ".");
        }

        // ── Step 5: Apply balance mutations ───────────────────────────────────────
        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        toAccount.setBalance(toAccount.getBalance().add(amount));

        // ── Step 6: Persist both accounts ─────────────────────────────────────────
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        log.info("Transfer of {} from '{}' to '{}' completed successfully.", amount, fromWallet, toWallet);

        // ── Step 7: Mark idempotency key as consumed (24-hour TTL) ─────────────
        stringRedisTemplate.opsForValue().set(idempotencyKey, "1", Duration.ofHours(24));
    }
}
