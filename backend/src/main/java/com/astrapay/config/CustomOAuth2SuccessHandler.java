package com.astrapay.config;

import com.astrapay.model.Account;
import com.astrapay.model.User;
import com.astrapay.repository.AccountRepository;
import com.astrapay.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String googleSub = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String picture = oidcUser.getPicture();

        User user = userRepository.findByGoogleSub(googleSub)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> {
                    log.info("Creating new user from Google OAuth: {}", email);
                    User newUser = new User();
                    newUser.setGoogleSub(googleSub);
                    newUser.setEmail(email);
                    newUser.setUsername(email.split("@")[0]); // Default username from email
                    newUser.setProfileImageUrl(picture);
                    newUser.setPassword("OAUTH2_USER"); // Placeholder
                    newUser.setRoles(Collections.singleton("ROLE_USER"));
                    User savedUser = userRepository.save(newUser);

                    // Create associated account
                    Account account = new Account();
                    account.setUserId(savedUser.getId());
                    account.setWalletAddress("ASTRA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    account.setBalance(BigDecimal.ZERO);
                    account.setCurrency("INR");
                    account.setStatus(Account.Status.ACTIVE);
                    accountRepository.save(account);

                    return savedUser;
                });

        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                "",
                user.getRoles().stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList())
        );

        String jwtToken = jwtUtils.generateToken(userDetails);
        log.info("OAuth2 login successful for user: {}. Redirecting to frontend.", user.getUsername());
        
        // Redirect to frontend with token
        String targetUrl = "http://localhost:5173/oauth-callback?token=" + jwtToken;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
