package com.astrapay.service;

import com.astrapay.dto.TransactionEvent;
import com.astrapay.model.Account;
import com.astrapay.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final AccountRepository accountRepository;

    @KafkaListener(topics = "transaction-events", groupId = "notification-group")
    public void handleTransactionEvent(TransactionEvent event) {
        log.info("Processing transaction event for notification: {}", event.getTransactionId());

        // Notify Recipient
        accountRepository.findByWalletAddress(event.getToWallet())
                .ifPresent(account -> {
                    String destination = "/topic/wallet/" + account.getUserId();
                    log.info("Sending SYNC notification to recipient: {}", destination);
                    messagingTemplate.convertAndSend(destination, "SYNC");
                });

        // Notify Sender (optional but good for real-time balance update)
        accountRepository.findByWalletAddress(event.getFromWallet())
                .ifPresent(account -> {
                    String destination = "/topic/wallet/" + account.getUserId();
                    log.info("Sending SYNC notification to sender: {}", destination);
                    messagingTemplate.convertAndSend(destination, "SYNC");
                });
    }
}
