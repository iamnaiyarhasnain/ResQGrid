package com.solostack.resqgrid.config;

import com.solostack.resqgrid.entity.UserRole;
import com.solostack.resqgrid.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        value = "resqgrid.seed-demo-users",
        havingValue = "true")
public class DemoAccountInitializer implements CommandLineRunner {

    private final AuthService authService;
    private final String demoPassword;

    public DemoAccountInitializer(
            AuthService authService,
            @Value("${aidlinkx.demo-password:${resqgrid.demo-password:AidLinkX@2026}}") String demoPassword) {
        this.authService = authService;
        this.demoPassword = demoPassword;
    }

    @Override
    public void run(String... args) {
        // AidLinkX Coordinator Accounts
        authService.createDemoCoordinator(
                "National Response Coordinator", "national@aidlinkx.demo",
                demoPassword, UserRole.NATIONAL_COORDINATOR);
        authService.createDemoCoordinator(
                "District Response Coordinator", "district@aidlinkx.demo",
                demoPassword, UserRole.DISTRICT_COORDINATOR);
        authService.createDemoCoordinator(
                "Field Response Coordinator", "field@aidlinkx.demo",
                demoPassword, UserRole.FIELD_COORDINATOR);

        // Backward-compatible fallback accounts
        authService.createDemoCoordinator(
                "National Response Coordinator", "national@resqgrid.demo",
                demoPassword, UserRole.NATIONAL_COORDINATOR);
        authService.createDemoCoordinator(
                "District Response Coordinator", "district@resqgrid.demo",
                demoPassword, UserRole.DISTRICT_COORDINATOR);
        authService.createDemoCoordinator(
                "Field Response Coordinator", "field@resqgrid.demo",
                demoPassword, UserRole.FIELD_COORDINATOR);
    }
}
