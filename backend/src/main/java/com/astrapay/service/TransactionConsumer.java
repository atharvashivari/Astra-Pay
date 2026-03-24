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
 public class TransactionConsumer {
 
     private final SimpMessagingTemplate messagingTemplate;
     private final AccountRepository accountRepository;
 
     @KafkaListener(topics = "transaction-events", groupId = "${spring.kafka.consumer.group-id}")
     public void consume(TransactionEvent event) {
         log.info("Consumed transaction event: {}", event.getTransactionId());
 
         if ("SUCCESS".equals(event.getStatus())) {
             // Notify the recipient
             notifyUser(event.getToWallet(), event);
             
             // Notify the sender (if it's not an external system)
             if (!"EXTERNAL_SYSTEM".equals(event.getFromWallet())) {
                 notifyUser(event.getFromWallet(), event);
             }
         }
     }
 
     private void notifyUser(String walletAddress, TransactionEvent event) {
         accountRepository.findByWalletAddress(walletAddress).ifPresent(account -> {
             String userId = account.getUserId();
             String destination = "/topic/wallet/" + userId;
             log.info("Broadcasting transaction update to {}: {}", destination, event.getTransactionId());
             messagingTemplate.convertAndSend(destination, event);
         });
     }
 }
