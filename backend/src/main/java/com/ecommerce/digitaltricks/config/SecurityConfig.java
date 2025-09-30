package com.ecommerce.digitaltricks.config;

import com.ecommerce.digitaltricks.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // 🔑 habilita o CorsFilter do CorsConfig
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/checkout").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/checkout/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/produtos/**").permitAll()

                        // 🔐 Somente admins podem gerenciar produtos e usuários
                        .requestMatchers(HttpMethod.GET, "/api/pedidos/me").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/perfis/me").hasAnyRole("USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/perfis/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/pedidos/**").hasAnyRole("USER","ADMIN")
                        .requestMatchers("/api/pedidos/**").hasRole("ADMIN")
                        .requestMatchers("/api/produtos/**").hasRole("ADMIN")
                        .requestMatchers("/api/usuarios/**").hasRole("ADMIN" )
                        .requestMatchers("/api/usuarios/me").hasAnyRole("USER","ADMIN")

                        // 🔐 Usuários logados podem acessar o carrinho
                        .requestMatchers("/api/carrinho/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
