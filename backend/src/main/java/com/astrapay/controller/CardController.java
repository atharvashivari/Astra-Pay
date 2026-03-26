package com.astrapay.controller;

import com.astrapay.model.Account;
import com.astrapay.model.AccountCard;
import com.astrapay.model.User;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.CardRepository;
import com.astrapay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @PostMapping("/issue")
    public ResponseEntity<?> issueCard(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (cardRepository.findByAccountId(account.getId()).isPresent()) {
            return ResponseEntity.badRequest().body("Card already exists for this account");
        }

        AccountCard card = new AccountCard();
        card.setUserId(user.getId());
        card.setAccountId(account.getId());
        card.setCardNumber(generateRandomCardNumber());
        card.setCvv(String.format("%03d", new Random().nextInt(1000)));
        card.setExpiryDate(LocalDate.now().plusYears(5));
        card.setStatus(AccountCard.CardStatus.ACTIVE);

        return ResponseEntity.ok(cardRepository.save(card));
    }

    @GetMapping("/my-card")
    public ResponseEntity<?> getMyCard(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return cardRepository.findByUserId(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    private String generateRandomCardNumber() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder("4829"); // Astra-Pay bin
        for (int i = 0; i < 12; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
