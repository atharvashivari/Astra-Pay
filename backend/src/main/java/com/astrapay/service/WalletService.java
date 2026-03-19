package com.astrapay.service;

import com.astrapay.dto.TransactionEvent;
import com.astrapay.exception.AccountNotFoundException;
import com.astrapay.exception.DuplicateTransactionException;
import com.astrapay.exception.InsufficientFundsException;
import com.astrapay.model.Account;
import com.astrapay.model.Transaction;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Core ledger service responsible for atomic fund transfers between Astra-Pay wallets.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Transfers {@code amount} from {@code fromWallet} to {@code toWallet} atomically.
     *
     * @param fromWallet     wallet address of the sender
     * @param toWallet       wallet address of the recipient
     * @param amount         positive amount to transfer
     * @param idempotencyKey unique client-supplied key to prevent duplicate submissions
     * @throws DuplicateTransactionException if the idempotency key already exists in Redis
     * @throws AccountNotFoundException      if an account is not found
     * @throws InsufficientFundsException   if the sender has insufficient funds
     * @throws IllegalStateException         if an account is not ACTIVE
     */
    @Transactional
    public void transferFunds(String fromWallet,
                              String toWallet,
                              BigDecimal amount,
                              String idempotencyKey) {

        // ── Step 1: Idempotency guard ──────────────────────────────────────────────
        checkIdempotency(idempotencyKey);

        // ── Step 2: Acquire locks ─────────────────────────────────────────────────
        Account[] accounts = acquireLocksInOrder(fromWallet, toWallet);
        Account fromAccount = accounts[0];
        Account toAccount   = accounts[1];

        // ── Step 3: Validations ───────────────────────────────────────────────────
        validateOwnership(fromAccount);
        validateAccountStatus(fromAccount, toAccount);
        validateFunds(fromAccount, amount);

        // ── Step 4: Persist Outbox Transaction (PENDING) ──────────────────────────
        Transaction transaction = Transaction.builder()
                .fromWallet(fromWallet)
                .toWallet(toWallet)
                .amount(amount)
                .idempotencyKey(idempotencyKey)
                .status(Transaction.Status.PENDING)
                .traceId(MDC.get("traceId"))
                .build();
        transaction = transactionRepository.save(transaction);

        // ── Step 5: Apply balance mutations ───────────────────────────────────────
        fromAccount.setBalance(fromAccount.getBalance().subtract(amount));
        toAccount.setBalance(toAccount.getBalance().add(amount));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        log.info("Transfer of {} from '{}' to '{}' completed successfully. Transaction ID: {}", 
                amount, fromWallet, toWallet, transaction.getId());

        // ── Step 6: Mark idempotency key as consumed (24-hour TTL) ─────────────
        stringRedisTemplate.opsForValue().set(idempotencyKey, "1", Duration.ofHours(24));

        // ── Step 7: Send transaction event after commit ────────────────────────
        sendAuditLog(transaction);
    }

    private void checkIdempotency(String idempotencyKey) {
        Boolean alreadyProcessed = stringRedisTemplate.hasKey(idempotencyKey);
        if (Boolean.TRUE.equals(alreadyProcessed)) {
            log.warn("Duplicate transaction attempt detected for idempotency key: {}", idempotencyKey);
            throw new DuplicateTransactionException(
                    "Transaction with idempotency key '" + idempotencyKey + "' has already been processed.");
        }
    }

    private Account[] acquireLocksInOrder(String fromWallet, String toWallet) {
        String firstLock  = fromWallet.compareTo(toWallet) <= 0 ? fromWallet : toWallet;
        String secondLock = fromWallet.compareTo(toWallet) <= 0 ? toWallet   : fromWallet;

        Account firstAccount = accountRepository.findWithLockByWalletAddress(firstLock)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + firstLock));

        Account secondAccount = accountRepository.findWithLockByWalletAddress(secondLock)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + secondLock));

        Account from = firstLock.equals(fromWallet) ? firstAccount : secondAccount;
        Account to   = firstLock.equals(toWallet)   ? firstAccount : secondAccount;
        return new Account[]{from, to};
    }

    private void validateOwnership(Account fromAccount) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!fromAccount.getUserId().equals(currentUsername)) {
            log.warn("Security Breach Attempt: User '{}' tried to transfer from wallet '{}'",
                    currentUsername, fromAccount.getWalletAddress());
            throw new AccessDeniedException("Unauthorized: You do not own the sender wallet.");
        }
    }

    private void validateAccountStatus(Account from, Account to) {
        if (from.getStatus() != Account.Status.ACTIVE) {
            throw new IllegalStateException("Sender account '" + from.getWalletAddress() + "' is " + from.getStatus());
        }
        if (to.getStatus() != Account.Status.ACTIVE) {
            throw new IllegalStateException("Recipient account '" + to.getWalletAddress() + "' is " + to.getStatus());
        }
    }

    private void validateFunds(Account from, BigDecimal amount) {
        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient funds in wallet '" + from.getWalletAddress() + "'");
        }
    }

    private void sendAuditLog(Transaction transaction) {
        TransactionEvent event = TransactionEvent.builder()
                .transactionId(transaction.getId().toString())
                .fromWallet(transaction.getFromWallet())
                .toWallet(transaction.getToWallet())
                .amount(transaction.getAmount())
                .timestamp(Instant.now().toString())
                .status("SUCCESS")
                .traceId(transaction.getTraceId())
                .build();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                emitKafkaEvent(event, transaction.getId());
            }
        });
    }

    private void emitKafkaEvent(TransactionEvent event, UUID dbTransactionId) {
        log.info("Sending audit log to Kafka for transaction: {}", dbTransactionId);
        
        CompletableFuture<?> future = kafkaTemplate.send("transaction-events", event);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Audit log successfully sent to Kafka. Marking transaction {} as SUCCESS.", dbTransactionId);
                updateTransactionStatus(dbTransactionId, Transaction.Status.SUCCESS);
            } else {
                log.error("Failed to send audit log to Kafka for transaction: {}. Watchdog will retry.", 
                        dbTransactionId, ex);
            }
        });
    }

    private void updateTransactionStatus(UUID id, Transaction.Status status) {
        transactionRepository.findById(id).ifPresent(t -> {
            t.setStatus(status);
            transactionRepository.save(t);
        });
    }

    /**
     * Loki Watchdog: Retriggers transactions stuck in PENDING for > 5 minutes.
     */
    @Scheduled(fixedRate = 60000) // Every minute
    public void retriggerPendingTransactions() {
        log.debug("Loki Watchdog: Scanning for stuck PENDING transactions...");
        Instant fiveMinutesAgo = Instant.now().minus(Duration.ofMinutes(5));
        List<Transaction> stuckTransactions = transactionRepository.findByStatusAndCreatedAtBefore(
                Transaction.Status.PENDING, fiveMinutesAgo);

        for (Transaction t : stuckTransactions) {
            log.warn("Loki Watchdog: Found stuck transaction {}. Retriggering Kafka event.", t.getId());
            TransactionEvent event = TransactionEvent.builder()
                    .transactionId(t.getId().toString())
                    .fromWallet(t.getFromWallet())
                    .toWallet(t.getToWallet())
                    .amount(t.getAmount())
                    .timestamp(Instant.now().toString())
                    .status("SUCCESS")
                    .traceId(t.getTraceId())
                    .build();
            emitKafkaEvent(event, t.getId());
        }
    }
}
