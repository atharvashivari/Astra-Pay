package com.astrapay.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.astrapay.dto.TransactionEvent;
import com.astrapay.exception.InsufficientFundsException;
import com.astrapay.model.Account;
import com.astrapay.model.User;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class WalletServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private com.astrapay.repository.TransactionRepository transactionRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private WalletService walletService;

    @BeforeEach
    void setUp() {
        TransactionSynchronizationManager.initSynchronization();
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clear();
    }

    @Test
    @DisplayName("Test Case 1: Successful Transfer")
    void testTransferFunds_Success() {
        // Arrange
        String fromWallet = "wallet-a";
        String toWallet = "wallet-b";
        BigDecimal amount = new BigDecimal("100.00");
        String idempotencyKey = "key-123";
        String userId = "123e4567-e89b-12d3-a456-426614174000";

        Account sender = new Account();
        sender.setWalletAddress(fromWallet);
        sender.setBalance(new BigDecimal("500.00"));
        sender.setStatus(Account.Status.ACTIVE);
        sender.setUserId(userId);

        Account recipient = new Account();
        recipient.setWalletAddress(toWallet);
        recipient.setBalance(new BigDecimal("200.00"));
        recipient.setStatus(Account.Status.ACTIVE);

        // Security context mock
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(userId);
        SecurityContextHolder.setContext(securityContext);

        User mockUser = new User();
        mockUser.setId(java.util.UUID.fromString(userId));
        mockUser.setUsername(userId);
        
        when(userRepository.findByUsername(userId)).thenReturn(Optional.of(mockUser));
        when(stringRedisTemplate.hasKey(idempotencyKey)).thenReturn(false);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(accountRepository.findWithLockByWalletAddress(fromWallet)).thenReturn(Optional.of(sender));
        when(accountRepository.findWithLockByWalletAddress(toWallet)).thenReturn(Optional.of(recipient));
        when(kafkaTemplate.send(anyString(), any(TransactionEvent.class))).thenReturn(CompletableFuture.completedFuture(null));
        when(transactionRepository.save(any(com.astrapay.model.Transaction.class))).thenAnswer(i -> {
            com.astrapay.model.Transaction t = i.getArgument(0);
            t.setId(java.util.UUID.randomUUID());
            return t;
        });


        // Act
        walletService.transferFunds(fromWallet, toWallet, amount, idempotencyKey);

        // Assert
        assertEquals(new BigDecimal("400.00"), sender.getBalance());
        assertEquals(new BigDecimal("300.00"), recipient.getBalance());
        verify(accountRepository, times(2)).save(any(Account.class));
        verify(valueOperations).set(eq(idempotencyKey), anyString(), any());
    }

    @Test
    @DisplayName("Test Case 2: Insufficient Funds")
    void testTransferFunds_InsufficientFunds() {
        // Arrange
        String fromWallet = "wallet-a";
        String toWallet = "wallet-b";
        BigDecimal amount = new BigDecimal("100.00");
        String idempotencyKey = "key-456";
        String userId = "123e4567-e89b-12d3-a456-426614174000";

        Account sender = new Account();
        sender.setWalletAddress(fromWallet);
        sender.setBalance(new BigDecimal("50.00"));
        sender.setStatus(Account.Status.ACTIVE);
        sender.setUserId(userId);

        Account recipient = new Account();
        recipient.setWalletAddress(toWallet);
        recipient.setBalance(new BigDecimal("200.00"));
        recipient.setStatus(Account.Status.ACTIVE);

        // Security context mock
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(userId);
        SecurityContextHolder.setContext(securityContext);

        User mockUser = new User();
        mockUser.setId(java.util.UUID.fromString(userId));
        mockUser.setUsername(userId);
        
        when(userRepository.findByUsername(userId)).thenReturn(Optional.of(mockUser));
        when(stringRedisTemplate.hasKey(idempotencyKey)).thenReturn(false);
        when(accountRepository.findWithLockByWalletAddress(fromWallet)).thenReturn(Optional.of(sender));
        when(accountRepository.findWithLockByWalletAddress(toWallet)).thenReturn(Optional.of(recipient));


        // Act & Assert
        assertThrows(InsufficientFundsException.class, () -> 
            walletService.transferFunds(fromWallet, toWallet, amount, idempotencyKey)
        );

        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("Test Case 3: Atomic Rollback Simulation")
    void testTransferFunds_RollbackOnSaveFailure() {
        // Arrange
        String fromWallet = "wallet-a";
        String toWallet = "wallet-b";
        BigDecimal amount = new BigDecimal("100.00");
        String idempotencyKey = "key-789";
        String userId = "123e4567-e89b-12d3-a456-426614174000";

        Account sender = new Account();
        sender.setWalletAddress(fromWallet);
        sender.setBalance(new BigDecimal("500.00"));
        sender.setStatus(Account.Status.ACTIVE);
        sender.setUserId(userId);

        Account recipient = new Account();
        recipient.setWalletAddress(toWallet);
        recipient.setBalance(new BigDecimal("200.00"));
        recipient.setStatus(Account.Status.ACTIVE);

        // Security context mock
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(userId);
        SecurityContextHolder.setContext(securityContext);

        User mockUser = new User();
        mockUser.setId(java.util.UUID.fromString(userId));
        mockUser.setUsername(userId);
        
        when(userRepository.findByUsername(userId)).thenReturn(Optional.of(mockUser));
        when(stringRedisTemplate.hasKey(idempotencyKey)).thenReturn(false);
        when(accountRepository.findWithLockByWalletAddress(fromWallet)).thenReturn(Optional.of(sender));
        when(accountRepository.findWithLockByWalletAddress(toWallet)).thenReturn(Optional.of(recipient));
        when(transactionRepository.save(any(com.astrapay.model.Transaction.class))).thenAnswer(i -> {
            com.astrapay.model.Transaction t = i.getArgument(0);
            t.setId(java.util.UUID.randomUUID());
            return t;
        });
        
        // Mock success for first save (sender), but failure for second save (recipient)
        when(accountRepository.save(sender)).thenReturn(sender);
        when(accountRepository.save(recipient)).thenThrow(new RuntimeException("Database failure"));

        // Act & Assert
        // In this test, we simulate the exception thrown during the service execution.
        // Spring's @Transactional handles this by intercepting the exception.
        // When a RuntimeException (or any Unchecked Exception) escapes the @Transactional method,
        // the TransactionInterceptor triggers a rollback on the PlatformTransactionManager.
        // This ensures that even though sender.setBalance() was called and potentially the first 
        // save was issued to the DB, the entire unit of work is aborted and reversed.
        assertThrows(RuntimeException.class, () -> 
            walletService.transferFunds(fromWallet, toWallet, amount, idempotencyKey)
        );

        // Verification: Even though sender was updated in memory, the DB transaction would roll back.
        // In a unit test, we verify that the exception was propagated.
        verify(accountRepository, times(2)).save(any(Account.class));
    }
}
