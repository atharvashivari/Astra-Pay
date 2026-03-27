package com.astrapay.service;

import com.astrapay.model.Account;
import com.astrapay.model.User;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

@Testcontainers
@SpringBootTest
public class WalletServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.4.0"));

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        // Using a mock/local redis or disabling it if possible for this test
        registry.add("spring.data.redis.host", () -> "localhost"); 
    }

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    private String sender1Wallet;
    private String sender2Wallet;
    private String recipientWallet;

    @BeforeEach
    void setUp() {
        accountRepository.deleteAll();
        userRepository.deleteAll();

        User u1 = userRepository.save(User.builder().username("sender1").email("s1@test.com").password("pass").build());
        User u2 = userRepository.save(User.builder().username("sender2").email("s2@test.com").password("pass").build());
        User ur = userRepository.save(User.builder().username("recipient").email("r@test.com").password("pass").build());

        Account a1 = accountRepository.save(Account.builder()
                .userId(u1.getId())
                .walletAddress("W1")
                .balance(new BigDecimal("1000.00"))
                .status(Account.Status.ACTIVE)
                .build());
        Account a2 = accountRepository.save(Account.builder()
                .userId(u2.getId())
                .walletAddress("W2")
                .balance(new BigDecimal("1000.00"))
                .status(Account.Status.ACTIVE)
                .build());
        Account ar = accountRepository.save(Account.builder()
                .userId(ur.getId())
                .walletAddress("WR")
                .balance(new BigDecimal("0.00"))
                .status(Account.Status.ACTIVE)
                .build());

        sender1Wallet = a1.getWalletAddress();
        sender2Wallet = a2.getWalletAddress();
        recipientWallet = ar.getWalletAddress();
    }

    @Test
    void testConcurrentTransfersToSameRecipient() throws InterruptedException {
        int threads = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);

        BigDecimal transferAmount = new BigDecimal("10.00");

        for (int i = 0; i < threads; i++) {
            final String sender = (i % 2 == 0) ? sender1Wallet : sender2Wallet;
            final String senderUsername = (i % 2 == 0) ? "sender1" : "sender2";
            final String idempotencyKey = "key-" + i;
            executorService.submit(() -> {
                try {
                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(senderUsername, null, 
                                    java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")))
                    );
                    walletService.transferFunds(sender, recipientWallet, transferAmount, idempotencyKey);
                } catch (Exception e) {
                    System.err.println("Transfer failed for " + senderUsername + ": " + e.getMessage());
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await(30, TimeUnit.SECONDS);
        executorService.shutdown();

        Account recipientAccount = accountRepository.findByWalletAddress(recipientWallet).orElseThrow();
        BigDecimal expectedBalance = transferAmount.multiply(new BigDecimal(threads));
        
        assertEquals(0, expectedBalance.compareTo(recipientAccount.getBalance()), 
                "Recipient balance should be exactly " + expectedBalance + " but was " + recipientAccount.getBalance());
    }
}
