package com.it3180hust.config;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
@EnableWebSecurity 
public class AppConfig{

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
            // configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Disable CSRF for stateless APIs
            .csrf(csrf -> csrf.disable())

            // Set stateless session policy
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Endpoint permissions
            .authorizeHttpRequests(auth -> auth
                // Admin endpoints (requires ROLE_ADMIN)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Public read-only endpoints
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/product/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ratings/product/**").permitAll()

                // Logged in Users endpoints
                .requestMatchers("/api/cart/**", "/api/cart_items/**").authenticated()
                .requestMatchers("/api/orders/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/ratings/**", "/api/reviews/**").authenticated()

                // Any other API route requires authentication; non-API permitted
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            );

            // // Default login options
            // .httpBasic(Customizer.withDefaults())
            // .formLogin(Customizer.withDefaults());

        http.addFilterBefore(new JwtValidator(), BasicAuthenticationFilter.class);
        return http.build();
    }

    @Bean 
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*")); // allowed al origins dynamically with credentials
        cfg.setAllowedMethods(Collections.singletonList("*"));
        cfg.setAllowedHeaders(Collections.singletonList("*"));
        cfg.setExposedHeaders(Collections.singletonList("Authorization"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        
        // lưu trữ Map giữa URL và cấu hình CORS (CorsConfiguration)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // ý nghĩa: áp dụng toàn bộ luật cors trong biến cfg cho mọi endpoint (/**) của server
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean 
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}