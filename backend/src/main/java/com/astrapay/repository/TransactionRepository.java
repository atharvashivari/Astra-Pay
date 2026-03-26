package com.astrapay.repository;

import com.astrapay.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByStatusAndCreatedAtBefore(Transaction.Status status, Instant dateTime);
    List<Transaction> findTop20ByFromWalletOrToWalletOrderByCreatedAtDesc(String fromWallet, String toWallet);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.toWallet = :wallet AND t.status = 'SUCCESS' AND t.createdAt >= :startOfMonth")
    BigDecimal sumCreditsForMonth(@Param("wallet") String wallet, @Param("startOfMonth") Instant startOfMonth);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.fromWallet = :wallet AND t.status = 'SUCCESS' AND t.createdAt >= :startOfMonth")
    BigDecimal sumDebitsForMonth(@Param("wallet") String wallet, @Param("startOfMonth") Instant startOfMonth);
}
