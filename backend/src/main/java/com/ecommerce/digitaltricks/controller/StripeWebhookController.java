package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    private final PedidoRepository pedidoRepository;

    public StripeWebhookController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

            if (dataObjectDeserializer.getObject().isPresent()) {
                Object stripeObject = dataObjectDeserializer.getObject().get();

                switch (event.getType()) {
                    case "checkout.session.completed":
                        Session session = (Session) stripeObject;

                        // Busca pelo stripeSessionId salvo no pedido
                        pedidoRepository.findByStripeSessionId(session.getId()).ifPresent(p -> {
                            p.setStatus("PAGO");
                            pedidoRepository.save(p);
                        });
                        break;

                    case "payment_intent.payment_failed":
                        PaymentIntent paymentIntent = (PaymentIntent) stripeObject;

                        // Ainda mantemos metadata como fallback
                        String pedidoIdFalhou = paymentIntent.getMetadata().get("pedidoId");
                        if (pedidoIdFalhou != null) {
                            pedidoRepository.findById(Long.valueOf(pedidoIdFalhou)).ifPresent(p -> {
                                p.setStatus("FALHOU");
                                pedidoRepository.save(p);
                            });
                        }
                        break;

                    default:
                        // Outros eventos podem ser ignorados por enquanto
                        break;
                }
            }

            return ResponseEntity.ok("✅ Webhook recebido: " + event.getType());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("⚠️ Webhook error: " + e.getMessage());
        }
    }
}
