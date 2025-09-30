package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.CarrinhoDTO;
import com.ecommerce.digitaltricks.model.Carrinho;
import com.ecommerce.digitaltricks.repository.CarrinhoRepository;
import com.ecommerce.digitaltricks.service.CarrinhoMapper;
import com.ecommerce.digitaltricks.service.CarrinhoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrinho")
@CrossOrigin(origins = "http://localhost:5173")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;
    private final CarrinhoRepository carrinhoRepository;
    private final CarrinhoMapper carrinhoMapper;

    public CarrinhoController(CarrinhoService carrinhoService, CarrinhoRepository carrinhoRepository, CarrinhoMapper carrinhoMapper) {
        this.carrinhoService = carrinhoService;
        this.carrinhoRepository = carrinhoRepository;
        this.carrinhoMapper = carrinhoMapper;
    }

    // 🔹 Buscar carrinho do usuário logado
    @GetMapping
    public ResponseEntity<CarrinhoDTO> getCarrinho(@RequestParam Long usuarioId) {
        Carrinho carrinho = carrinhoService.buscarCarrinho(usuarioId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    // 🔹 Adicionar item
    @PostMapping("/adicionar")
    public ResponseEntity<CarrinhoDTO> adicionarItem(
            @RequestParam Long usuarioId,
            @RequestParam Long produtoId,
            @RequestParam(defaultValue = "1") int quantidade
    ) {
        Carrinho carrinho = carrinhoService.adicionarItem(usuarioId, produtoId, quantidade);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    // 🔹 Diminuir item
    @PostMapping("/diminuir")
    public ResponseEntity<CarrinhoDTO> diminuirItem(
            @RequestParam Long usuarioId,
            @RequestParam Long produtoId
    ) {
        Carrinho carrinho = carrinhoService.diminuirItem(usuarioId, produtoId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    @PostMapping("/limpar")
    public ResponseEntity<CarrinhoDTO> limparCarrinho(@RequestParam Long usuarioId) {
        Carrinho carrinho = carrinhoService.buscarCarrinho(usuarioId);
        if (carrinho == null) {
            return ResponseEntity.notFound().build();
        }
        carrinhoService.limparCarrinho(usuarioId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    // 🔹 Remover item
    @DeleteMapping("/remover/{produtoId}")
    public ResponseEntity<CarrinhoDTO> removerItem(
            @RequestParam Long usuarioId,
            @PathVariable Long produtoId
    ) {
        Carrinho carrinho = carrinhoService.removerItem(usuarioId, produtoId);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }
}
