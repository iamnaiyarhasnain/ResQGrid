package com.solostack.resqgrid.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")

                        // Allow the live Angular application
                        .allowedOrigins(
                                "https://main.d1vtxuu4ic8mpk.amplifyapp.com",
                                "http://localhost:4200"
                        )

                        // HTTP methods used by our application
                        .allowedMethods(
                                "GET",
                                "POST",
                                "PUT",
                                "PATCH",
                                "DELETE",
                                "OPTIONS"
                        )

                        // Headers sent by Angular/browser
                        .allowedHeaders("*")

                        // Allow browser credentials/authorization handling
                        .allowCredentials(true);
            }
        };
    }
}