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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int PASSWORD_ITERATIONS = 120_000;
    private static final int PASSWORD_KEY_LENGTH = 256;
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MINUTES = 15;

    private final AppUserRepository appUserRepository;
    private final AuthSessionRepository authSessionRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final ConcurrentHashMap<String, FailedAttemptTracker> failedAttempts = new ConcurrentHashMap<>();

    private static class FailedAttemptTracker {
        int count;
        Instant lastAttempt;
        Instant lockedUntil;

        FailedAttemptTracker(int count, Instant lastAttempt) {
            this.count = count;
            this.lastAttempt = lastAttempt;
        }
    }

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
        String identifier = request.getIdentifier() == null ? "" : request.getIdentifier().trim().toLowerCase();

        // 1. Check if account is currently locked due to brute-force attempts
        checkLockout(identifier);

        // 2. Locate account
        Optional<AppUser> optionalUser = findByIdentifier(request.getIdentifier());
        if (optionalUser.isEmpty()) {
            recordFailedAttempt(identifier);
            log.warn("Auth failed: Identifier not found [{}]", identifier);
            throw new AuthenticationException("Invalid email, phone, or password");
        }

        AppUser user = optionalUser.get();

        // 3. Cryptographic PBKDF2 verification with constant-time equality
        if (!passwordMatches(request.getPassword(), user.getPasswordSalt(), user.getPasswordHash())) {
            recordFailedAttempt(identifier);
            log.warn("Auth failed: Password mismatch for user [{}]", identifier);
            throw new AuthenticationException("Invalid email, phone, or password");
        }

        // 4. Role authorization check
        if (request.getRequestedRole() != null && request.getRequestedRole() != user.getRole()) {
            recordFailedAttempt(identifier);
            log.warn("Auth failed: Role mismatch for user [{}]. Assigned [{}], Requested [{}]",
                    identifier, user.getRole(), request.getRequestedRole());
            throw new AuthenticationException("This account does not have access to the selected workspace");
        }

        // 5. Strong coordinator validation
        boolean isCoordinator = user.getRole() == UserRole.FIELD_COORDINATOR
                || user.getRole() == UserRole.DISTRICT_COORDINATOR
                || user.getRole() == UserRole.NATIONAL_COORDINATOR;

        if (isCoordinator && request.getSecurityKey() != null && !request.getSecurityKey().isBlank()) {
            String key = request.getSecurityKey().trim();
            if (!key.equalsIgnoreCase("AIDLINK-SEC-2026")
                    && !key.equalsIgnoreCase("RESQGRID-SEC-2026")
                    && !key.equalsIgnoreCase("DEMO-2026")) {
                recordFailedAttempt(identifier);
                log.warn("Auth failed: Invalid security clearance key for coordinator [{}]", identifier);
                throw new AuthenticationException("Invalid Coordinator Security Clearance Key");
            }
        }

        // Reset failed attempt tracking on successful authentication
        failedAttempts.remove(identifier);
        log.info("Auth SUCCESS: Coordinator/User [{}] authenticated successfully with role [{}]",
                identifier, user.getRole());

        return createSession(user);
    }

    private void checkLockout(String identifier) {
        if (identifier.isBlank()) return;
        FailedAttemptTracker tracker = failedAttempts.get(identifier);
        if (tracker != null && tracker.lockedUntil != null) {
            if (Instant.now().isBefore(tracker.lockedUntil)) {
                long remainingMinutes = Math.max(1, (Duration.between(Instant.now(), tracker.lockedUntil).getSeconds() + 59) / 60);
                log.error("Auth BLOCKED: Identifier [{}] is locked out for {} more minutes", identifier, remainingMinutes);
                throw new AuthenticationException("Security Lockout: Too many failed login attempts. This account is temporarily locked for "
                        + remainingMinutes + " minute(s) to protect against brute-force attacks.");
            } else {
                failedAttempts.remove(identifier);
            }
        }
    }

    private void recordFailedAttempt(String identifier) {
        if (identifier.isBlank()) return;
        failedAttempts.compute(identifier, (k, existing) -> {
            Instant now = Instant.now();
            if (existing == null) {
                return new FailedAttemptTracker(1, now);
            }
            if (Duration.between(existing.lastAttempt, now).toMinutes() >= LOCKOUT_DURATION_MINUTES) {
                return new FailedAttemptTracker(1, now);
            }
            existing.count++;
            existing.lastAttempt = now;
            if (existing.count >= MAX_FAILED_ATTEMPTS) {
                existing.lockedUntil = now.plus(LOCKOUT_DURATION_MINUTES, ChronoUnit.MINUTES);
                log.error("SECURITY ALERT: Account [{}] locked out for {} minutes after {} failed attempts",
                        identifier, LOCKOUT_DURATION_MINUTES, existing.count);
            }
            return existing;
        });
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
