package com.astrapay.controller;

import com.astrapay.model.SavedCard;
import com.astrapay.model.User;
import com.astrapay.repository.SavedCardRepository;
import com.astrapay.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
public class CardController {

    private final SavedCardRepository savedCardRepository;
    private final UserRepository userRepository;

    @PostMapping("/save-token")
    public ResponseEntity<?> saveToken(@AuthenticationPrincipal UserDetails userDetails, @RequestBody SaveCardRequest request) {
        return userRepository.findByUsername(userDetails.getUsername())
                .map(user -> {
                    SavedCard card = new SavedCard();
                    card.setUserId(user.getId());
                    card.setRazorpayTokenId(request.getRazorpayTokenId());
                    card.setLastFour(request.getLastFour());
                    card.setCardBrand(request.getCardBrand());
                    card.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
                    
                    SavedCard saved = savedCardRepository.save(card);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<SavedCard>> getCards(@AuthenticationPrincipal UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .map(user -> ResponseEntity.ok(savedCardRepository.findByUserId(user.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class SaveCardRequest {
        private String razorpayTokenId;
        private String lastFour;
        private String cardBrand;
        private Boolean isDefault;
    }
}
