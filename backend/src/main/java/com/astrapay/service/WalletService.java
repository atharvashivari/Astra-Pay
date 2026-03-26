package com.astrapay.service;

import com.astrapay.dto.TransactionEvent;
import com.astrapay.exception.AccountNotFoundException;
import com.astrapay.exception.DuplicateTransactionException;
import com.astrapay.exception.InsufficientFundsException;
import com.astrapay.model.Account;
import com.astrapay.model.Transaction;
import com.astrapay.model.User;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.TransactionRepository;
import com.astrapay.repository.UserRepository;
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
import java.util.Optional;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
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
    private final UserRepository userRepository;

    /**
     * Retrieves the account for a given username. Used by the balance endpoint.
     */
    public Optional<Account> getAccountByUsername(String username) {
        return userRepository.findByUsername(username)
                .flatMap(user -> accountRepository.findByUserId(user.getId()));
    }

    /**
     * Retrieves recent transactions for a given username. Used by the transactions endpoint.
     */
    public List<Transaction> getTransactionsByUsername(String username) {
        return userRepository.findByUsername(username)
                .flatMap(user -> accountRepository.findByUserId(user.getId()))
                .map(account -> transactionRepository
                        .findTop20ByFromWalletOrToWalletOrderByCreatedAtDesc(
                                account.getWalletAddress(), account.getWalletAddress()))
                .orElse(List.of());
    }

    /**
     * Retrieves a single transaction by ID.
     */
    public Optional<Transaction> getTransactionById(UUID id) {
        return transactionRepository.findById(id);
    }

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
    public Transaction transferFunds(String fromWallet,
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
                .status(Transaction.Status.SUCCESS)
                .type(Transaction.Type.TRANSFER)
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

        return transaction;
    }

    /**
     * Securely credits a user's wallet. Used primarily by payment webhooks.
     */
    @Transactional
    public void creditFunds(String walletAddress, BigDecimal amount) {
        Account account = accountRepository.findWithLockByWalletAddress(walletAddress)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + walletAddress));
                
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
        
        Transaction transaction = Transaction.builder()
                .fromWallet("EXTERNAL_SYSTEM")
                .toWallet(walletAddress)
                .amount(amount)
                .idempotencyKey("deposit_" + UUID.randomUUID().toString())
                .status(Transaction.Status.SUCCESS)
                .type(Transaction.Type.DEPOSIT)
                .traceId(MDC.get("traceId"))
                .build();
        transaction = transactionRepository.save(transaction);
        
        log.info("Successfully credited wallet {} with amount {}", walletAddress, amount);
        
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
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AccessDeniedException("User not found: " + currentUsername));

        if (!fromAccount.getUserId().equals(currentUser.getId())) {
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
                .type(transaction.getType() != null ? transaction.getType().name() : "TRANSFER")
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
        CompletableFuture.runAsync(() -> {
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
        });
    }

    private void updateTransactionStatus(UUID id, Transaction.Status status) {
        transactionRepository.findById(id).ifPresent(t -> {
            t.setStatus(status);
            transactionRepository.save(t);
        });
    }

    /**
     * Loki Watchdog: Scans for stuck PENDING transactions and auto-resolves them to SUCCESS.
     */
    @Scheduled(fixedRate = 60000) // Every minute
    public void retriggerPendingTransactions() {
        log.debug("Loki Watchdog: Scanning for stuck PENDING transactions...");
        Instant fiveMinutesAgo = Instant.now().minus(Duration.ofMinutes(5));
        List<Transaction> stuckTransactions = transactionRepository.findByStatusAndCreatedAtBefore(
                Transaction.Status.PENDING, fiveMinutesAgo);

        for (Transaction t : stuckTransactions) {
            log.warn("Loki Watchdog: Auto-resolving stuck transaction {} to SUCCESS.", t.getId());
            updateTransactionStatus(t.getId(), Transaction.Status.SUCCESS);
        }
    }

    /**
     * Calculates the sum of credits and debits for the current month.
     */
    public Map<String, BigDecimal> getMonthlyStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found: " + username));
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AccountNotFoundException("Account not found for user: " + username));

        Instant startOfMonth = LocalDate.now().withDayOfMonth(1)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();
        
        BigDecimal credits = transactionRepository.sumCreditsForMonth(account.getWalletAddress(), startOfMonth);
        BigDecimal debits = transactionRepository.sumDebitsForMonth(account.getWalletAddress(), startOfMonth);
        
        return Map.of(
            "credits", credits,
            "debits", debits,
            "net", credits.subtract(debits)
        );
    }
}
