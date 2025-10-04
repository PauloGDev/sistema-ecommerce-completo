package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private final PedidoRepository pedidoRepository;

    public StripeWebhookController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        String endpointSecret = "whsec_xxxxxxxxx"; // ⚠️ substitua pelo segredo do webhook no Dashboard/CLI

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Assinatura inválida");
        }

        // Deserializar os dados do evento
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = deserializer.getObject().orElse(null);

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) stripeObject;

            // recuperar o pedidoId que você salvou no metadata
            String pedidoId = session.getMetadata().get("pedidoId");

            pedidoRepository.findById(Long.parseLong(pedidoId)).ifPresent(pedido -> {
                pedido.setStatus("PAGO");
                pedidoRepository.save(pedido);
            });
        }

        return ResponseEntity.ok("success");
    }
}
