package com.astrapay.repository;

import com.astrapay.model.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * JPA repository for {@link Account} entities.
 *
 * <p>{@link #findWithLockByWalletAddress} acquires a {@code PESSIMISTIC_WRITE} lock
 * on the selected row, preventing concurrent modifications to the same account
 * during a balance update within a transaction.
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    /**
     * Finds an account by its unique wallet address (no lock).
     */
    Optional<Account> findByWalletAddress(String walletAddress);

    /**
     * Finds an account by its wallet address and acquires a row-level PESSIMISTIC_WRITE
     * lock for thread-safe balance mutation. Must be called within an active transaction.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.walletAddress = :walletAddress")
    Optional<Account> findWithLockByWalletAddress(@Param("walletAddress") String walletAddress);
}
