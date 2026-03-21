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

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.astrapay.dto.TransactionEvent;
import com.astrapay.exception.InsufficientFundsException;
import com.astrapay.model.Account;
import com.astrapay.repository.AccountRepository;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private WalletService walletService;

    @Test
    @DisplayName("Test Case 1: Successful Transfer")
    void testTransferFunds_Success() {
        // Arrange
        String fromWallet = "wallet-a";
        String toWallet = "wallet-b";
        BigDecimal amount = new BigDecimal("100.00");
        String idempotencyKey = "key-123";
        String userId = "user-123";

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

        when(stringRedisTemplate.hasKey(idempotencyKey)).thenReturn(false);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(accountRepository.findWithLockByWalletAddress(fromWallet)).thenReturn(Optional.of(sender));
        when(accountRepository.findWithLockByWalletAddress(toWallet)).thenReturn(Optional.of(recipient));
        when(kafkaTemplate.send(anyString(), any(TransactionEvent.class))).thenReturn(CompletableFuture.completedFuture(null));


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
        String userId = "user-123";

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
        String userId = "user-123";

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

        when(stringRedisTemplate.hasKey(idempotencyKey)).thenReturn(false);
        when(accountRepository.findWithLockByWalletAddress(fromWallet)).thenReturn(Optional.of(sender));
        when(accountRepository.findWithLockByWalletAddress(toWallet)).thenReturn(Optional.of(recipient));

        
        // Mock success for first save (sender), but failure for second save (recipient)
        doNothing().when(accountRepository).save(sender);
        doThrow(new RuntimeException("Database failure")).when(accountRepository).save(recipient);

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
