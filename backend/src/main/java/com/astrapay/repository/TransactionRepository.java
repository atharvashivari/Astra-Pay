package com.astrapay.repository;

import com.astrapay.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByStatusAndCreatedAtBefore(Transaction.Status status, Instant dateTime);
    List<Transaction> findTop20ByFromWalletOrToWalletOrderByCreatedAtDesc(String fromWallet, String toWallet);
}
