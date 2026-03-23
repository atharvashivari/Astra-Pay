package com.astrapay.integration;

import com.astrapay.dto.AuthResponse;
import com.astrapay.dto.LoginRequest;
import com.astrapay.dto.RegisterRequest;
import com.astrapay.dto.TransferRequest;
import com.astrapay.model.Account;
import com.astrapay.model.User;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.UserRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@EmbeddedKafka(partitions = 1, topics = {"transaction-events"})
@TestPropertySource(properties = {"spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}"})
public class EndToEndTransferTest {

    @LocalServerPort
    private int port = 8080;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @BeforeEach
    public void setup() {
        RestAssured.port = port;
        cleanup();
    }

    @AfterEach
    public void cleanup() {
        accountRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void testPostmanGauntlet() {
        // Step 1: Register two users (sender and receiver)
        RegisterRequest senderReg = new RegisterRequest();
        senderReg.setUsername("sender");
        senderReg.setEmail("sender@astrapay.com");
        senderReg.setPassword("password");

        given()
                .contentType(ContentType.JSON)
                .body(senderReg)
                .when()
                .post("/api/v1/auth/register")
                .then()
                .statusCode(200);

        RegisterRequest receiverReg = new RegisterRequest();
        receiverReg.setUsername("receiver");
        receiverReg.setEmail("receiver@astrapay.com");
        receiverReg.setPassword("password");

        given()
                .contentType(ContentType.JSON)
                .body(receiverReg)
                .when()
                .post("/api/v1/auth/register")
                .then()
                .statusCode(200);

        // Get receiver's wallet address
        User receiver = userRepository.findByUsername("receiver").orElseThrow();
        Account receiverAccount = accountRepository.findByUserId(receiver.getId().toString()).get(0);
        String receiverWallet = receiverAccount.getWalletAddress();

        // Step 2: Login as sender and extract the JWT token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("sender");
        loginRequest.setPassword("password");

        AuthResponse authResponse = given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .when()
                .post("/api/v1/auth/login")
                .then()
                .statusCode(200)
                .extract()
                .as(AuthResponse.class);

        String token = authResponse.getToken();

        // Step 3: (Manual DB Setup) Give sender a balance of ₹1000
        User sender = userRepository.findByUsername("sender").orElseThrow();
        Account senderAccount = accountRepository.findByUserId(sender.getId().toString()).get(0);
        senderAccount.setBalance(new BigDecimal("1000.00"));
        accountRepository.save(senderAccount);
        String senderWallet = senderAccount.getWalletAddress();

        // Step 4: Perform a POST /api/v1/wallets/transfer with valid X-Idempotency-Key and JWT. Assert 200 OK.
        String idempotencyKey = UUID.randomUUID().toString();
        TransferRequest transferRequest = new TransferRequest();
        transferRequest.setFromWallet(senderWallet);
        transferRequest.setToWallet(receiverWallet);
        transferRequest.setAmount(new BigDecimal("100.00"));

        given()
                .header("Authorization", "Bearer " + token)
                .header("X-Idempotency-Key", idempotencyKey)
                .contentType(ContentType.JSON)
                .body(transferRequest)
                .when()
                .post("/api/v1/wallet/transfer")
                .then()
                .statusCode(200)
                .body("message", equalTo("Transfer successful"));

        // Step 5: Perform the same request again. Assert 409 Conflict (Idempotency check).
        given()
                .header("Authorization", "Bearer " + token)
                .header("X-Idempotency-Key", idempotencyKey)
                .contentType(ContentType.JSON)
                .body(transferRequest)
                .when()
                .post("/api/v1/wallet/transfer")
                .then()
                .statusCode(409);

        // Step 6: Try a transfer with ₹5000. Assert 400 Bad Request (Insufficient funds).
        String newIdempotencyKey = UUID.randomUUID().toString();
        transferRequest.setAmount(new BigDecimal("5000.00"));

        given()
                .header("Authorization", "Bearer " + token)
                .header("X-Idempotency-Key", newIdempotencyKey)
                .contentType(ContentType.JSON)
                .body(transferRequest)
                .when()
                .post("/api/v1/wallet/transfer")
                .then()
                .statusCode(400);
    }
}
