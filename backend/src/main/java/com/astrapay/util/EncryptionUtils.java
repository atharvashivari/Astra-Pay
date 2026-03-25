package com.astrapay.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
public class EncryptionUtils {

    private static final String ALGORITHM = "AES";
    
    @Value("${app.security.encryption-key:my-secret-key-32}") // Should be 16, 24, or 32 chars
    private String key;

    public String encrypt(String data) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(getKeyBytes(), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedData = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encryptedData);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting data", e);
        }
    }

    public String decrypt(String encryptedData) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(getKeyBytes(), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decodedData = Base64.getDecoder().decode(encryptedData);
            return new String(cipher.doFinal(decodedData));
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting data", e);
        }
    }

    private byte[] getKeyBytes() {
        byte[] keyBytes = new byte[16];
        byte[] originalBytes = key.getBytes();
        System.arraycopy(originalBytes, 0, keyBytes, 0, Math.min(originalBytes.length, 16));
        return keyBytes;
    }
}
