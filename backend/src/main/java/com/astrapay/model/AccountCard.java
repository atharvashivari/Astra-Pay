package com.astrapay.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "account_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountCard {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID accountId;

    @Column(nullable = false, unique = true)
    private String cardNumber; // Masked or full encrypted

    @Column(nullable = false)
    private String cvv; // Encrypted

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardStatus status = CardStatus.ACTIVE;

    public enum CardStatus {
        ACTIVE, FROZEN
    }
}
