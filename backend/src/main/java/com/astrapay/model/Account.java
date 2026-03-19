package com.astrapay.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Check;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Check(constraints = "balance >= 0")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false, unique = true)
    private String walletAddress;

    @Column(nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Version
    private Long version;

    public enum Status {
        ACTIVE, FROZEN
    }
}
