package com.astrapay.repository;

import com.astrapay.model.SavedCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedCardRepository extends JpaRepository<SavedCard, UUID> {
    List<SavedCard> findByUserId(UUID userId);
}
