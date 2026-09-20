package com.solostack.resqgrid.service;

import com.solostack.resqgrid.dto.AuthResponse;
import com.solostack.resqgrid.dto.LoginRequest;
import com.solostack.resqgrid.dto.RegisterRequest;
import com.solostack.resqgrid.dto.UserResponse;
import com.solostack.resqgrid.entity.AppUser;
import com.solostack.resqgrid.entity.AuthSession;
import com.solostack.resqgrid.entity.UserRole;
import com.solostack.resqgrid.exception.AuthenticationException;
import com.solostack.resqgrid.exception.AuthorizationException;
import com.solostack.resqgrid.repository.AppUserRepository;
import com.solostack.resqgrid.repository.AuthSessionRepository;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;

@Service
public class AuthService {

    private static final int PASSWORD_ITERATIONS = 120_000;
    private static final int PASSWORD_KEY_LENGTH = 256;
    private final AppUserRepository appUserRepository;
    private final AuthSessionRepository authSessionRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            AppUserRepository appUserRepository,
            AuthSessionRepository authSessionRepository) {
        this.appUserRepository = appUserRepository;
        this.authSessionRepository = authSessionRepository;
    }

    public AuthResponse registerResident(RegisterRequest request) {
        AppUser user = createUser(
                request.getName(), request.getEmail(), request.getPhone(),
                request.getPassword(), UserRole.RESIDENT);
        return createSession(user);
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = findByIdentifier(request.getIdentifier())
                .orElseThrow(() -> new AuthenticationException("Invalid email, phone, or password"));

        if (!passwordMatches(request.getPassword(), user.getPasswordSalt(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email, phone, or password");
        }

        if (request.getRequestedRole() != null && request.getRequestedRole() != user.getRole()) {
            throw new AuthenticationException("This account does not have access to the selected workspace");
        }

        return createSession(user);
    }

    public AppUser optionalUser(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return null;
        }
        return getUserFromHeader(authorization);
    }

    public AppUser requireUser(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            throw new AuthenticationException("Please sign in to continue");
        }
        return getUserFromHeader(authorization);
    }

    public AppUser requireCoordinator(String authorization) {
        AppUser user = requireUser(authorization);

        if (user.getRole() != UserRole.FIELD_COORDINATOR
                && user.getRole() != UserRole.DISTRICT_COORDINATOR
                && user.getRole() != UserRole.NATIONAL_COORDINATOR) {
            throw new AuthorizationException("Coordinator access is required");
        }

        return user;
    }

    public UserResponse getCurrentUser(String authorization) {
        return new UserResponse(requireUser(authorization));
    }

    public void logout(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return;
        }

        String token = extractToken(authorization);
        authSessionRepository.findByToken(token).ifPresent(authSessionRepository::delete);
    }

    public AppUser createDemoCoordinator(
            String name,
            String email,
            String password,
            UserRole role) {
        return findByIdentifier(email).orElseGet(() ->
                createUser(name, email, null, password, role));
    }

    private AppUser createUser(
            String name,
            String email,
            String phone,
            String password,
            UserRole role) {

        String normalizedEmail = normalizeEmail(email);
        String normalizedPhone = normalizePhone(phone);

        if (normalizedEmail == null && normalizedPhone == null) {
            throw new IllegalArgumentException("Add an email address or phone number");
        }

        if (normalizedEmail != null && appUserRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("An account already exists with this email address");
        }

        if (normalizedPhone != null && appUserRepository.findByPhone(normalizedPhone).isPresent()) {
            throw new IllegalArgumentException("An account already exists with this phone number");
        }

        byte[] salt = new byte[16];
        secureRandom.nextBytes(salt);

        AppUser user = new AppUser();
        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);
        user.setPasswordSalt(Base64.getEncoder().encodeToString(salt));
        user.setPasswordHash(hashPassword(password, salt));
        user.setRole(role);
        user.setCreatedAt(Instant.now());
        return appUserRepository.save(user);
    }

    private AuthResponse createSession(AppUser user) {
        byte[] tokenBytes = new byte[48];
        secureRandom.nextBytes(tokenBytes);

        AuthSession session = new AuthSession();
        session.setToken(Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes));
        session.setUser(user);
        session.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        authSessionRepository.save(session);

        return new AuthResponse(
                session.getToken(), session.getExpiresAt(), new UserResponse(user));
    }

    private AppUser getUserFromHeader(String authorization) {
        String token = extractToken(authorization);
        AuthSession session = authSessionRepository.findByToken(token)
                .orElseThrow(() -> new AuthenticationException("Your session is invalid or has expired"));

        if (session.getExpiresAt().isBefore(Instant.now())) {
            authSessionRepository.delete(session);
            throw new AuthenticationException("Your session has expired. Please sign in again");
        }

        return session.getUser();
    }

    private String extractToken(String authorization) {
        if (!authorization.startsWith("Bearer ")) {
            throw new AuthenticationException("Use a Bearer token to authenticate");
        }
        return authorization.substring("Bearer ".length()).trim();
    }

    private Optional<AppUser> findByIdentifier(String identifier) {
        String normalized = identifier == null ? "" : identifier.trim();
        if (normalized.contains("@")) {
            return appUserRepository.findByEmailIgnoreCase(normalized.toLowerCase());
        }
        return appUserRepository.findByPhone(normalizePhone(normalized));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        String normalized = email.trim().toLowerCase();
        if (!normalized.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("Enter a valid email address");
        }
        return normalized;
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        String normalized = phone.replaceAll("[^0-9+]", "");
        if (!normalized.matches("^\\+?[0-9]{7,15}$")) {
            throw new IllegalArgumentException("Enter a valid phone number");
        }
        return normalized;
    }

    private String hashPassword(String password, byte[] salt) {
        try {
            PBEKeySpec specification = new PBEKeySpec(
                    password.toCharArray(), salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH);
            byte[] encoded = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(specification).getEncoded();
            specification.clearPassword();
            return Base64.getEncoder().encodeToString(encoded);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to securely process password", exception);
        }
    }

    private boolean passwordMatches(String password, String salt, String expectedHash) {
        byte[] actual = Base64.getDecoder().decode(
                hashPassword(password, Base64.getDecoder().decode(salt)));
        byte[] expected = Base64.getDecoder().decode(expectedHash);
        return MessageDigest.isEqual(actual, expected);
    }
}
