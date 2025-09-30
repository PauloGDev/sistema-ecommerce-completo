package com.ecommerce.digitaltricks.dto;

public class AuthResponse {
    private String token;
    private Long id;
    private String username;

    public AuthResponse(String token, Long id, String username) {
        this.token = token;
        this.id = id;
        this.username = username;
    }

    public String getToken() { return token; }
    public Long getUsuarioId() { return id; }
    public String getUsername() { return username; }
}
