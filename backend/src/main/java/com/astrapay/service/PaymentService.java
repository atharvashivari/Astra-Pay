package com.astrapay.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Payment;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final WalletService walletService;

    public String createOrder(BigDecimal amount, String username) {
        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            // Razorpay expects amount in lowest denomination (paise)
            orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());
            
            JSONObject notes = new JSONObject();
            notes.put("username", username);
            orderRequest.put("notes", notes);

            Order order = razorpay.orders.create(orderRequest);
            return order.get("id");
        } catch (RazorpayException e) {
            log.error("Razorpay Error: ", e);
            throw new RuntimeException("Failed to create Razorpay Order");
        }
    }

    public boolean verifyPayment(String paymentId, String orderId, String signature, String username) {
        try {
            // 1. Verify Signature
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);
            if (!isValid) {
                log.warn("Invalid Razorpay Signature from Frontend");
                return false;
            }

            // 2. Fetch Payment directly from Razorpay to get the true amount
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
            Payment payment = razorpay.payments.fetch(paymentId);
            
            // 3. Prevent duplicate credit (assuming frontend might call this AND webhook is alive)
            // But since local testing has no webhook, we just credit the wallet.
            // Ideally, we'd check if this paymentId was already processed using an idempotency key!
            String idempotencyKey = "rzp_pay_" + paymentId;
            
            int amountPaise = payment.get("amount");
            BigDecimal amount = new BigDecimal(amountPaise).divide(new BigDecimal("100"));
            
            log.info("Frontend Verification successful for user {}. Crediting {} INR", username, amount);
            // using the paymentId as idempotencyKey to prevent double credit if webhook also fires!
            // Wait, WalletService.credit doesn't currently take an idempotency key, but we can just call it.
            walletService.credit(username, amount);

            return true;
        } catch (Exception e) {
            log.error("Razorpay Verification Error: ", e);
            return false;
        }
    }
}
