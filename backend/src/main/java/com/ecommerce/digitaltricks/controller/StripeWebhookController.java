package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.service.EmailService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@Transactional
@RestController
@RequestMapping("/api/stripe/webhook")
public class StripeWebhookController {

    private final PedidoRepository pedidoRepository;
    private final EmailService emailService;

    @Value("${stripe.api.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    public StripeWebhookController(PedidoRepository pedidoRepository, EmailService emailService) {
        this.pedidoRepository = pedidoRepository;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestHeader("Stripe-Signature") String sigHeader,
            @RequestBody String payload) {

        System.out.println("📦 Webhook recebido: " + payload.substring(0, Math.min(500, payload.length())));
        System.out.println("🔑 Assinatura: " + sigHeader);

        Stripe.apiKey = stripeSecretKey;
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Assinatura inválida");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded":
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject().orElse(null);

                if (paymentIntent != null) {
                    String pedidoIdStr = paymentIntent.getMetadata().get("pedidoId");

                    if (pedidoIdStr != null) {
                        Long pedidoId = Long.parseLong(pedidoIdStr);
                        Optional<Pedido> pedidoOpt = pedidoRepository.findById(pedidoId);

                        if (pedidoOpt.isPresent()) {
                            Pedido pedido = pedidoOpt.get();

                            if (!"PAGO".equalsIgnoreCase(pedido.getStatus())) {
                                pedido.setStatus("PAGO");
                                pedidoRepository.save(pedido);
                                System.out.println("✅ Pedido #" + pedidoId + " atualizado para PAGO.");

                                // (Opcional) envio de e-mail de confirmação
                                if (pedido.getEmail() != null && !pedido.getEmail().isBlank()) {
                                    try {
                                        emailService.enviarPagamentoAprovado(
                                                pedido.getEmail(),
                                                pedido.getNomeCompleto() != null ? pedido.getNomeCompleto() : "Cliente",
                                                String.valueOf(pedido.getId()),
                                                pedido.getTotal()
                                        );
                                    } catch (Exception e) {
                                        System.err.println("Erro ao enviar e-mail: " + e.getMessage());
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            default:
                System.out.println("ℹ️ Evento ignorado: " + event.getType());
        }

        return ResponseEntity.ok("Webhook recebido com sucesso");
    }

}
