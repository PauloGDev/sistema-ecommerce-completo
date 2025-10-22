package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.*;
import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.service.CheckoutService;
import com.ecommerce.digitaltricks.service.EmailService;
import com.ecommerce.digitaltricks.service.ProdutoService;
import com.ecommerce.digitaltricks.utils.CpfValidator;
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
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CheckoutService checkoutService;
    private final ProdutoRepository produtoRepository;
    private final ProdutoService produtoService;
    private final EmailService emailService;

    public PedidoController(PedidoRepository pedidoRepository,
                            UsuarioRepository usuarioRepository,
                            CheckoutService checkoutService, ProdutoRepository produtoRepository, ProdutoService produtoService, EmailService emailService) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.checkoutService = checkoutService;
        this.produtoRepository = produtoRepository;
        this.produtoService = produtoService;
        this.emailService = emailService;
    }

    @GetMapping("/{pedidoId}/status")
    public ResponseEntity<?> getStatus(@PathVariable Long pedidoId) {
        return pedidoRepository.findById(pedidoId)
                .map(pedido -> ResponseEntity.ok(Map.of("status", pedido.getStatus())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/criar")
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

        // Monta os itens do pedido respeitando o preço enviado pelo frontend
        List<ItemPedido> itens = pedidoRequest.itens().stream()
                .map(i -> {
                    Produto produto = produtoRepository.findById(i.produtoId())
                            .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + i.produtoId()));

                    Variacao variacaoSelecionada = null;
                    String nomeProduto = i.nomeProduto();
                    String imagemUrl = produto.getImagemUrl();
                    Double precoUnitario;

                    produtoService.atualizarPedidosProduto(i.produtoId());

                    // Usa o preço enviado pelo frontend se for válido
                    if (i.precoUnitario() != null && i.precoUnitario() > 0) {
                        precoUnitario = i.precoUnitario();
                    } else if (i.variacaoId() != null) {
                        // caso tenha variação selecionada
                        variacaoSelecionada = produto.getVariacoes().stream()
                                .filter(v -> v.getId().equals(i.variacaoId()))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Variação não encontrada: " + i.variacaoId()));

                        precoUnitario = (variacaoSelecionada.getPreco() != null && variacaoSelecionada.getPreco() > 0)
                                ? variacaoSelecionada.getPreco()
                                : produto.getPrecoBase();

                        nomeProduto += " - " + variacaoSelecionada.getNome();
                    } else {
                        precoUnitario = produto.getPrecoBase();
                    }

                    ItemPedido item = new ItemPedido(produto, nomeProduto, i.quantidade(), precoUnitario, imagemUrl);
                    item.setVariacao(variacaoSelecionada);
                    return item;
                })
                .collect(Collectors.toList());

        double total = itens.stream()
                .mapToDouble(item -> item.getPrecoUnitario() * item.getQuantidade())
                .sum();

        if (pedidoRequest.frete() != null && pedidoRequest.frete().valor() != null) {
            total += pedidoRequest.frete().valor();
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setItens(itens);
        pedido.setEnderecoEntrega(endereco);
        pedido.setStatus("PENDENTE");
        pedido.setTotal(total);

        pedido.setServicoFrete(pedidoRequest.frete() != null ? pedidoRequest.frete().servico() : null);
        pedido.setValorFrete(pedidoRequest.frete() != null ? pedidoRequest.frete().valor() : null);
        pedido.setPrazoFrete(pedidoRequest.frete() != null ? pedidoRequest.frete().prazo() : null);

        pedido.setNomeCompleto(
                (pedidoRequest.nomeCompleto() != null && !pedidoRequest.nomeCompleto().isBlank())
                        ? pedidoRequest.nomeCompleto()
                        : usuario.getPerfil().getNomeCompleto()
        );
        String cpfFinal = (pedidoRequest.cpf() != null && !pedidoRequest.cpf().isBlank())
                ? pedidoRequest.cpf()
                : usuario.getPerfil().getCpf();

        if (cpfFinal != null && !CpfValidator.isValidCPF(cpfFinal)) {
            throw new RuntimeException("CPF inválido. Verifique e tente novamente.");
        }
        pedido.setCpf(cpfFinal);

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

        // Atualiza estoque
        for (ItemPedido item : pedido.getItens()) {
            if (item.getVariacao() != null) {
                Variacao var = item.getVariacao();
                var.setEstoque(var.getEstoque() - item.getQuantidade());
                produtoRepository.save(var.getProduto()); // salva produto pai se necessário
            } else {
                Produto produto = item.getProduto();
                produto.setEstoque(produto.getEstoque() - item.getQuantidade());
                produtoRepository.save(produto);
            }
        }

        return ResponseEntity.ok(toDTO(salvo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoDTO> buscarPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // Se o usuário não for admin, só pode ver o próprio pedido
        boolean isAdmin = usuario.getRoles().stream()
                .anyMatch(r -> r.equalsIgnoreCase("ROLE_ADMIN"));

        if (!isAdmin && !pedido.getUsuario().getId().equals(usuario.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(toDTO(pedido));
    }


    // Usuário comum vê apenas seus pedidos
    @GetMapping("/me")
    public ResponseEntity<List<PedidoDTO>> listarMeusPedidos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Pedido> pedidos = pedidoRepository.findByUsuarioId(usuario.getId());
        List<PedidoDTO> dtos = pedidos.stream().map(this::toDTO).toList();

        return ResponseEntity.ok(dtos);
    }

    // Admin: listar todos pedidos (paginado, com filtro opcional de status)
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

    @PutMapping("/{id}")
    public ResponseEntity<PedidoDTO> atualizarPedido(
            @PathVariable Long id,
            @RequestBody PedidoUpdateDTO dto) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        String statusAnterior = pedido.getStatus(); // guarda o status anterior

        if (dto.total() != null) pedido.setTotal(dto.total());
        if (dto.status() != null) pedido.setStatus(dto.status());
        if (dto.nomeCompleto() != null) pedido.setNomeCompleto(dto.nomeCompleto());

        if (dto.enderecoId() != null) {
            Endereco endereco = pedido.getUsuario().getPerfil().getEnderecos().stream()
                    .filter(e -> e.getId().equals(dto.enderecoId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
            pedido.setEnderecoEntrega(endereco);
        }

        if (dto.cpf() != null) pedido.setCpf(dto.cpf());
        if (dto.telefone() != null) pedido.setTelefone(dto.telefone());
        if (dto.email() != null) pedido.setEmail(dto.email());
        if (dto.linkRastreio() != null) pedido.setLinkRastreio(dto.linkRastreio());

        // ⚙️ Atualizar estoque conforme status
        produtoService.atualizarProduto(pedido, statusAnterior, pedido.getStatus());
        Pedido salvo = pedidoRepository.save(pedido);

        try {
            switch (pedido.getStatus().toUpperCase()) {
                case "PAGO", "PAGAMENTO_APROVADO" -> emailService.enviarPagamentoAprovado(
                        pedido.getEmail(),
                        pedido.getNomeCompleto(),
                        String.valueOf(pedido.getId()),
                        pedido.getTotal()
                );
                case "ENVIADO", "DESPACHADO" -> {
                    String rastreio = pedido.getLinkRastreio() != null ? pedido.getLinkRastreio() : "Aguardando código";
                    emailService.enviarPedidoEnviado(
                            pedido.getEmail(),
                            pedido.getNomeCompleto(),
                            String.valueOf(pedido.getId()),
                            rastreio
                    );
                }
                default -> { /* outros status não disparam e-mail */ }
            }
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail: " + e.getMessage());
        }

        return ResponseEntity.ok(toDTO(salvo));
    }

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
                        pedido.getEnderecoEntrega().getComplemento(),
                        pedido.getEnderecoEntrega().isPadrao()
                ) : null,
                pedido.getItens().stream()
                        .map(i -> new ItemPedidoDTO(
                                i.getId(),
                                i.getVariacao() != null ? i.getVariacao().getId() : null,
                                i.getNomeProduto(),
                                i.getQuantidade(),
                                i.getPrecoUnitario(),
                                i.getImagemUrl()
                        ))
                        .toList(),
                pedido.getNomeCompleto(),
                pedido.getCpf(),
                pedido.getTelefone(),
                pedido.getEmail(),
                pedido.getUsuario() != null ? new Usuario(
                        pedido.getUsuario().getId(),
                        pedido.getUsuario().getUsername(),
                        pedido.getUsuario().getNome(),
                        pedido.getUsuario().getEmail(),
                        pedido.getUsuario().getStatus(),
                        pedido.getUsuario().getRoles()
                ) : null,
                pedido.getLinkRastreio(),
                pedido.getServicoFrete(),
                pedido.getValorFrete(),
                pedido.getPrazoFrete()
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
            return ResponseEntity.status(403).build(); // se o pedido não for do usuário logado
        }

        // Se já existir uma sessão Stripe para esse pedido, reutiliza
        if (pedido.getStripeSessionId() != null) {
            Session session = Session.retrieve(pedido.getStripeSessionId());
            Map<String, Object> resp = Map.of("url", session.getUrl());
            return ResponseEntity.ok(resp);
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("https://sublimeperfumes.com.br/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("https://sublimeperfumes.com.br/cancel")
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

// salvar id da sessão Stripe no pedido (para reaproveitar depois)
        pedido.setStripeSessionId(session.getId());
        pedidoRepository.save(pedido);

        Map<String, Object> response = Map.of(
                "id", session.getId(),   // ⚡ devolve sessionId
                "url", session.getUrl()  // opcional, se quiser abrir direto com window.location.href
        );
        return ResponseEntity.ok(response);

    }


}
