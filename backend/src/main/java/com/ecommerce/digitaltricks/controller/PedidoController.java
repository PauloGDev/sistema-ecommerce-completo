package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.EnderecoDTO;
import com.ecommerce.digitaltricks.dto.ItemPedidoDTO;
import com.ecommerce.digitaltricks.dto.PedidoDTO;
import com.ecommerce.digitaltricks.dto.PedidoRequestDTO;
import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.service.CheckoutService;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.stripe.Stripe;


import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:5173")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CheckoutService checkoutService;
    private final ProdutoRepository produtoRepository;

    public PedidoController(PedidoRepository pedidoRepository,
                            UsuarioRepository usuarioRepository,
                            CheckoutService checkoutService, ProdutoRepository produtoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.checkoutService = checkoutService;
        this.produtoRepository = produtoRepository;
    }

    @PostMapping
    public ResponseEntity<PedidoDTO> criarPedido(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PedidoRequestDTO pedidoRequest
    ) {
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Endereco endereco = usuario.getPerfil().getEnderecos().stream()
                .filter(e -> pedidoRequest.enderecoId() != null
                        ? e.getId().equals(pedidoRequest.enderecoId())
                        : e.isPadrao())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Endereço inválido"));

        // 🔹 buscar produtos e montar os itens
        List<ItemPedido> itens = pedidoRequest.itens().stream()
                .map(i -> {
                    Produto produto = produtoRepository.findById(i.produtoId())
                            .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + i.produtoId()));

                    return new ItemPedido(
                            produto.getNome(),
                            i.quantidade(),
                            produto.getPrecoBase()
                    );
                })
                .toList();

        // calcular total automaticamente
        double total = itens.stream()
                .mapToDouble(item -> item.getPrecoUnitario() * item.getQuantidade())
                .sum();

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setItens(itens);
        pedido.setEnderecoEntrega(endereco);
        pedido.setStatus("PENDENTE");
        pedido.setTotal(total);

        // dados do comprador
        pedido.setNomeCompleto(
                (pedidoRequest.nomeCompleto() != null && !pedidoRequest.nomeCompleto().isBlank())
                        ? pedidoRequest.nomeCompleto()
                        : usuario.getPerfil().getNomeCompleto()
        );
        pedido.setCpf(
                (pedidoRequest.cpf() != null && !pedidoRequest.cpf().isBlank())
                        ? pedidoRequest.cpf()
                        : usuario.getPerfil().getCpf()
        );
        pedido.setTelefone(
                (pedidoRequest.telefone() != null && !pedidoRequest.telefone().isBlank())
                        ? pedidoRequest.telefone()
                        : usuario.getPerfil().getTelefone()
        );
        pedido.setEmail(
                (pedidoRequest.email() != null && !pedidoRequest.email().isBlank())
                        ? pedidoRequest.email()
                        : usuario.getEmail()
        );

        Pedido salvo = pedidoRepository.save(pedido);

        return ResponseEntity.ok(toDTO(salvo));
    }


    // 🔹 Usuário comum vê apenas seus pedidos
    @GetMapping("/me")
    public ResponseEntity<List<PedidoDTO>> listarMeusPedidos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Pedido> pedidos = pedidoRepository.findByUsuarioId(usuario.getId());
        List<PedidoDTO> dtos = pedidos.stream().map(this::toDTO).toList();

        return ResponseEntity.ok(dtos);
    }

    // 🔹 Admin: listar todos pedidos (paginado, com filtro opcional de status)
    @GetMapping
    public ResponseEntity<Page<PedidoDTO>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        Page<Pedido> pedidos = checkoutService.listarTodos(page, size, status);
        Page<PedidoDTO> dtos = pedidos.map(this::toDTO);
        return ResponseEntity.ok(dtos);
    }

    // 🔹 Admin pode atualizar status
    @PutMapping("/{id}/status")
    public ResponseEntity<PedidoDTO> atualizarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        pedido.setStatus(body.get("status"));
        Pedido atualizado = pedidoRepository.save(pedido);

        return ResponseEntity.ok(toDTO(atualizado));
    }

    // 🔹 Admin pode atualizar dados do pedido
    @PutMapping("/{id}")
    public ResponseEntity<PedidoDTO> atualizarPedido(
            @PathVariable Long id,
            @RequestBody Pedido pedidoAtualizado) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // Atualizar campos simples
        pedido.setUsuario(pedidoAtualizado.getUsuario());
        pedido.setTotal(pedidoAtualizado.getTotal());
        pedido.setStatus(pedidoAtualizado.getStatus());
        pedido.setEnderecoEntrega(pedidoAtualizado.getEnderecoEntrega());
        pedido.setNomeCompleto(pedidoAtualizado.getNomeCompleto());
        pedido.setCpf(pedidoAtualizado.getCpf());
        pedido.setTelefone(pedidoAtualizado.getTelefone());
        pedido.setEmail(pedidoAtualizado.getEmail());

        // ✅ Atualizar itens corretamente
        pedido.getItens().clear();
        if (pedidoAtualizado.getItens() != null) {
            for (ItemPedido item : pedidoAtualizado.getItens()) {
                pedido.getItens().add(item);
            }
        }

        Pedido salvo = pedidoRepository.save(pedido);

        return ResponseEntity.ok(toDTO(salvo));
    }


    // 🔹 Converte entidade → DTO
    private PedidoDTO toDTO(Pedido pedido) {
        return new PedidoDTO(
                pedido.getId(),
                pedido.getData(),
                pedido.getTotal(),
                pedido.getStatus(),
                pedido.getEnderecoEntrega() != null ? new EnderecoDTO(
                        pedido.getEnderecoEntrega().getId(),
                        pedido.getEnderecoEntrega().getLogradouro(),
                        pedido.getEnderecoEntrega().getNumero(),
                        pedido.getEnderecoEntrega().getBairro(),
                        pedido.getEnderecoEntrega().getCidade(),
                        pedido.getEnderecoEntrega().getEstado(),
                        pedido.getEnderecoEntrega().getCep(),
                        pedido.getEnderecoEntrega().isPadrao()
                ) : null,
                pedido.getItens().stream()
                        .map(i -> new ItemPedidoDTO(
                                i.getNomeProduto(),
                                i.getQuantidade(),
                                i.getPrecoUnitario()
                        ))
                        .collect(Collectors.toList()),
                pedido.getNomeCompleto(),
                pedido.getCpf(),
                pedido.getTelefone(),
                pedido.getEmail()
        );
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<Map<String, Object>> iniciarCheckout(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws Exception {
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (!pedido.getUsuario().getId().equals(usuario.getId())) {
            return ResponseEntity.status(403).build(); // ❌ se o pedido não for do usuário logado
        }

        // Se já existir uma sessão Stripe para esse pedido, reutiliza
        if (pedido.getStripeSessionId() != null) {
            Session session = Session.retrieve(pedido.getStripeSessionId());
            Map<String, Object> resp = Map.of("url", session.getUrl());
            return ResponseEntity.ok(resp);
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:5173/cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("brl")
                                                .setUnitAmount((long) (pedido.getTotal() * 100)) // em centavos
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Pedido #" + pedido.getId())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("pedidoId", String.valueOf(pedido.getId()))
                .build();

        Session session = Session.create(params);

// 🔹 salvar id da sessão Stripe no pedido (para reaproveitar depois)
        pedido.setStripeSessionId(session.getId());
        pedidoRepository.save(pedido);

        Map<String, Object> response = Map.of(
                "id", session.getId(),   // ⚡ devolve sessionId
                "url", session.getUrl()  // opcional, se quiser abrir direto com window.location.href
        );
        return ResponseEntity.ok(response);

    }
}
