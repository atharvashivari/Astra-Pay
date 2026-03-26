package com.astrapay.repository;

import com.astrapay.model.AccountCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CardRepository extends JpaRepository<AccountCard, UUID> {
    Optional<AccountCard> findByAccountId(UUID accountId);
    Optional<AccountCard> findByUserId(UUID userId);
}
