package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.service.EmailService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*") // permite requisições do frontend
public class StripePaymentController {

    private static final Logger logger = LoggerFactory.getLogger(StripePaymentController.class);
    private final PedidoRepository pedidoRepository;
    private final EmailService emailService;

    @Value("${stripe.api.secret.key}")
    private String stripeSecretKey;

    public StripePaymentController(PedidoRepository pedidoRepository, EmailService emailService) {
        this.pedidoRepository = pedidoRepository;
        this.emailService = emailService;
    }

    /**
     * Cria um PaymentIntent no Stripe e retorna o clientSecret.
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            // Inicializa Stripe com chave secreta
            Stripe.apiKey = stripeSecretKey;

            if (!request.containsKey("amount")) {
                return ResponseEntity.badRequest().body(Map.of("error", "O campo 'amount' é obrigatório."));
            }

            double amount = Double.parseDouble(request.get("amount").toString());
            long amountInCents = Math.round(amount * 100);

            logger.info("Criando PaymentIntent para valor: R$ {}", amount);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("brl")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putMetadata("pedidoId", request.get("pedidoId").toString())
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            logger.info("PaymentIntent criado com sucesso: {}", paymentIntent.getId());

            return ResponseEntity.ok(Map.of("clientSecret", paymentIntent.getClientSecret()));

        } catch (StripeException e) {
            logger.error("Erro ao criar PaymentIntent Stripe: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Erro inesperado: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Erro interno no servidor."));
        }
    }

    @PostMapping("/confirmar/{pedidoId}")
    public ResponseEntity<?> confirmarPagamento(
            @PathVariable Long pedidoId,
            @RequestBody Map<String, Object> payload) {

        try {
            Stripe.apiKey = stripeSecretKey;

            // Recupera o ID do PaymentIntent vindo do front
            String paymentIntentId = (String) payload.get("paymentIntentId");
            if (paymentIntentId == null || paymentIntentId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "PaymentIntentId é obrigatório."));
            }

            // Busca PaymentIntent diretamente na Stripe
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            // Busca o pedido no banco
            Pedido pedido = pedidoRepository.findById(pedidoId)
                    .orElseThrow(() -> new RuntimeException("Pedido não encontrado."));

            // Valida status do pagamento
            if ("succeeded".equals(paymentIntent.getStatus())) {

                try {
                    emailService.enviarConfirmacaoPedido(
                            pedido.getEmail(),
                            pedido.getNomeCompleto(),
                            String.valueOf(pedido.getId())
                    );
                } catch (Exception e) {
                    System.err.println("Erro ao enviar e-mail de confirmação: " + e.getMessage());
                }

                    pedido.setStatus("PAGO");
                    pedidoRepository.save(pedido);
                    logger.info("✅ Pedido #{} confirmado como PAGO via Stripe.", pedidoId);
                return ResponseEntity.ok(Map.of(
                        "status", "succeeded",
                        "mensagem", "Pagamento confirmado com sucesso."
                ));
            } else {
                logger.info("⚠️ Pedido #{} ainda não pago. Status Stripe: {}", pedidoId, paymentIntent.getStatus());
                return ResponseEntity.ok(Map.of(
                        "status", paymentIntent.getStatus(),
                        "mensagem", "Pagamento ainda não confirmado."
                ));
            }

        } catch (StripeException e) {
            logger.error("Erro ao verificar pagamento Stripe: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Erro interno ao confirmar pagamento: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Erro ao confirmar pagamento."));
        }
    }


    @PostMapping("/reiniciar/{pedidoId}")
    public ResponseEntity<?> reiniciarPagamento(@PathVariable Long pedidoId) {
        try {
            Stripe.apiKey = stripeSecretKey;

            // Busca o pedido no banco
            Pedido pedido = pedidoRepository.findById(pedidoId)
                    .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

            if (pedido.getStatus().equalsIgnoreCase("PAGO")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Pedido já foi pago."));
            }

            // Cria novo PaymentIntent
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(Math.round(pedido.getTotal() * 100))
                    .setCurrency("brl")
                    .setDescription("Pedido #" + pedido.getId())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putMetadata("pedidoId", String.valueOf(pedidoId))
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Atualiza o pedido com o novo ID do pagamento
            pedido.setStripeSessionId(paymentIntent.getId());
            pedidoRepository.save(pedido);

            // Retorna clientSecret para o React
            return ResponseEntity.ok(Map.of("clientSecret", paymentIntent.getClientSecret()));

        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

}
