package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final PedidoRepository pedidoRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${frontend.success.url}")
    private String successUrl;

    @Value("${frontend.cancel.url}")
    private String cancelUrl;

    public CheckoutController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @PostConstruct
    public void init() {
        // Inicializa Stripe com a chave secreta
        Stripe.apiKey = stripeApiKey;
    }

    @PostMapping("/{pedidoId}")
    public ResponseEntity<?> createCheckoutSession(@PathVariable Long pedidoId) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(pedidoId);

        if (pedidoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Pedido não encontrado");
        }

        Pedido pedido = pedidoOpt.get();

        try {
            // Cria 1 item representando o pedido inteiro
            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("brl")
                                    .setUnitAmount((long) (pedido.getTotal() * 100)) // total em centavos
                                    .setProductData(
                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                    .setName("Pedido #" + pedido.getId())
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            // Monta sessão do Stripe
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl)
                    .addLineItem(lineItem)
                    .putMetadata("pedidoId", pedido.getId().toString()) // útil para webhook
                    .build();

            // Cria a sessão
            Session session = Session.create(params);

            // Salva ID da sessão no pedido
            pedido.setStripeSessionId(session.getId());
            pedidoRepository.save(pedido);

            // Retorna para frontend
            return ResponseEntity.ok(Map.of("id", session.getId()));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body("Erro Stripe: " + e.getMessage());
        }
    }
}
