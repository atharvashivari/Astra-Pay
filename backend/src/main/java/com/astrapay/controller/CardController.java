package com.astrapay.controller;

import com.astrapay.model.Card;
import com.astrapay.model.User;
import com.astrapay.repository.CardRepository;
import com.astrapay.repository.UserRepository;
import com.astrapay.util.EncryptionUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final EncryptionUtils encryptionUtils;
    private final Random random = new Random();

    @PostMapping("/issue")
    public ResponseEntity<?> issueCard(Principal principal, @RequestParam(defaultValue = "VISA") String type) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String rawCardNumber = generateRandomCardNumber();
        String rawCvv = String.format("%03d", random.nextInt(1000));
        LocalDate expiryDate = LocalDate.now().plusYears(5);

        Card card = Card.builder()
                .user(user)
                .cardNumber(encryptionUtils.encrypt(rawCardNumber))
                .cvv(rawCvv)
                .expiryDate(expiryDate)
                .type(type)
                .status(Card.Status.ACTIVE)
                .build();

        cardRepository.save(card);

        return ResponseEntity.ok(Map.of(
                "id", card.getId(),
                "cardNumber", rawCardNumber, // Return raw once on issue
                "cvv", rawCvv,
                "expiryDate", expiryDate.toString(),
                "type", card.getType(),
                "status", card.getStatus()
        ));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMyCards(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Card> cards = cardRepository.findByUser(user);
        
        List<Map<String, Object>> response = cards.stream().map(card -> Map.<String, Object>of(
                "id", card.getId(),
                "cardNumber", maskCardNumber(encryptionUtils.decrypt(card.getCardNumber())),
                "type", card.getType(),
                "status", card.getStatus(),
                "expiryDate", card.getExpiryDate().toString()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private String generateRandomCardNumber() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private String maskCardNumber(String number) {
        return "**** **** **** " + number.substring(12);
    }
}
