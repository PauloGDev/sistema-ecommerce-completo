package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.CarrinhoDTO;
import com.ecommerce.digitaltricks.model.Carrinho;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.model.Variacao;
import com.ecommerce.digitaltricks.repository.CarrinhoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.repository.VariacaoRepository;
import com.ecommerce.digitaltricks.service.CarrinhoMapper;
import com.ecommerce.digitaltricks.service.CarrinhoService;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/carrinho")
@CrossOrigin(origins = "*")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;
    private final CarrinhoRepository carrinhoRepository;
    private final CarrinhoMapper carrinhoMapper;
    private final VariacaoRepository variacaoRepository;
    private final ProdutoRepository produtoRepository;

    public CarrinhoController(CarrinhoService carrinhoService,
                              CarrinhoRepository carrinhoRepository,
                              CarrinhoMapper carrinhoMapper,
                              VariacaoRepository variacaoRepository,
                              ProdutoRepository produtoRepository) {
        this.carrinhoService = carrinhoService;
        this.carrinhoRepository = carrinhoRepository;
        this.carrinhoMapper = carrinhoMapper;
        this.variacaoRepository = variacaoRepository;
        this.produtoRepository = produtoRepository;
    }

    // Buscar carrinho do usuário logado
    @GetMapping
    public ResponseEntity<CarrinhoDTO> getCarrinho(@RequestParam Long usuarioId) {
        Carrinho carrinho = carrinhoService.buscarCarrinho(usuarioId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    // Adicionar item ao carrinho
    @PostMapping("/adicionar")
    public ResponseEntity<CarrinhoDTO> adicionarItem(@RequestBody AdicionarCarrinhoRequest request) {
        Carrinho carrinho = carrinhoService.adicionarItem(
                request.getUsuarioId(),
                request.getProdutoId(),
                request.getVariacaoId(),
                request.getQuantidade()
        );
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    // Diminuir item
    @PostMapping("/diminuir")
    public ResponseEntity<CarrinhoDTO> diminuirItem(
            @RequestParam Long usuarioId,
            @RequestParam Long produtoId
    ) {
        Carrinho carrinho = carrinhoService.diminuirItem(usuarioId, produtoId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }
    // Adicionar item (quantidade)
    @PostMapping("/aumentar")
    public ResponseEntity<CarrinhoDTO> aumentarItem(
            @RequestParam Long usuarioId,
            @RequestParam Long produtoId
    ) {
        Carrinho carrinho = carrinhoService.aumentarItem(usuarioId, produtoId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    // Limpar carrinho
    @PostMapping("/limpar")
    public ResponseEntity<CarrinhoDTO> limparCarrinho(@RequestParam Long usuarioId) {
        Carrinho carrinho = carrinhoService.buscarCarrinho(usuarioId);
        if (carrinho == null) {
            return ResponseEntity.notFound().build();
        }
        carrinhoService.limparCarrinho(usuarioId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    // Remover item
    @DeleteMapping("/remover/{produtoId}")
    public ResponseEntity<CarrinhoDTO> removerItem(
            @RequestParam Long usuarioId,
            @PathVariable Long produtoId
    ) {
        Carrinho carrinho = carrinhoService.removerItem(usuarioId, produtoId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    public static class AdicionarCarrinhoRequest {
        private Long usuarioId;
        private Long produtoId;
        private Long variacaoId;
        private int quantidade;

        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

        public Long getProdutoId() { return produtoId; }
        public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }

        public Long getVariacaoId() { return variacaoId; }
        public void setVariacaoId(Long variacaoId) { this.variacaoId = variacaoId; }

        public int getQuantidade() { return quantidade; }
        public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    }
}
