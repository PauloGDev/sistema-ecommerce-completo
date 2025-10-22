package com.ecommerce.digitaltricks.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/melhorenvio")
public class MelhorEnvioController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${melhorenvio.client-id}")
    private String clientId;

    @Value("${melhorenvio.client-secret}")
    private String clientSecret;

    @Value("${melhorenvio.sandbox:true}")
    private boolean sandbox;

    private String getBaseUrl() {
        return sandbox ? "https://sandbox.melhorenvio.com.br/api/v2" : "https://melhorenvio.com.br/api/v2";
    }

    private String getOAuthUrl() {
        return sandbox ? "https://sandbox.melhorenvio.com.br/oauth/token" : "https://melhorenvio.com.br/oauth/token";
    }

    private String gerarToken() {
        try {
            String url = getOAuthUrl();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", "client_credentials");
            formData.add("client_id", clientId);
            formData.add("client_secret", clientSecret);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

            if (response.getBody() != null && response.getBody().get("access_token") != null) {
                String token = (String) response.getBody().get("access_token");
                System.out.println("🟢 Token gerado com sucesso: " + token);
                return token;
            } else {
                throw new RuntimeException("Resposta inválida ao solicitar token do Melhor Envio: " + response);
            }

        } catch (Exception e) {
            throw new RuntimeException("Falha ao autenticar com o Melhor Envio: " + e.getMessage(), e);
        }
    }

    @PostMapping("/frete")
    public ResponseEntity<?> calcularFrete(@RequestBody Map<String, Object> payload) {
        try {
            String token = gerarToken();
            String url = getBaseUrl() + "/me/shipment/calculate";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao calcular frete", "details", e.getMessage()));
        }
    }
}
