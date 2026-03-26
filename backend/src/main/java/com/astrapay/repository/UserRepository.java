package com.astrapay.repository;

import com.astrapay.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByGoogleSub(String googleSub);
    java.util.List<User> findByUsernameContainingIgnoreCaseOrPhoneNumberContaining(String username, String phoneNumber);
}
