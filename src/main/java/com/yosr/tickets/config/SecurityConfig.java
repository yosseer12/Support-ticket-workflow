package com.yosr.tickets.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/** Demo security: HTTP Basic with in-memory users. Replace with JWT for a real deployment. */
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html").permitAll()
                .requestMatchers("/api/tasks/**").hasAnyRole("AGENT", "ADMIN")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    UserDetailsService users() {
        return new InMemoryUserDetailsManager(
                User.withUsername("customer").password("{noop}customer").roles("USER").build(),
                User.withUsername("agent").password("{noop}agent").roles("AGENT").build(),
                User.withUsername("senior").password("{noop}senior").roles("AGENT").build(),
                User.withUsername("admin").password("{noop}admin").roles("ADMIN").build());
    }
}
