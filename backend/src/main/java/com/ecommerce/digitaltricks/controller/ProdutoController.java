package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.ProdutoDTO;
import com.ecommerce.digitaltricks.dto.VariacaoDTO;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.service.ProdutoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final ProdutoRepository produtoRepository;

    public ProdutoController(ProdutoService produtoService, ProdutoRepository produtoRepository) {
        this.produtoService = produtoService;
        this.produtoRepository = produtoRepository;
    }

    // Buscar produto por ID
    @GetMapping("/{id}")
    public ProdutoDTO buscarProduto(@PathVariable Long id) {
        Produto p = produtoService.buscarPorId(id);

        return new ProdutoDTO(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                p.getPrecoBase(),
                p.getEstoque(),
                p.getSlug(),
                p.getImagemUrl(), // ✅ Agora vai pro front
                p.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList()
        );
    }

    // Criar
    @PostMapping
    public Produto criarProduto(@RequestParam String nome,
                                @RequestParam String descricao,
                                @RequestParam Double preco,
                                @RequestParam Integer estoque,
                                @RequestParam MultipartFile imagem) throws IOException {
        return produtoService.criarProduto(nome, descricao, preco, estoque, imagem);
    }

    // Listar
    @GetMapping
    public List<ProdutoDTO> listar() {
        return produtoRepository.findAll().stream()
                .map(p -> new ProdutoDTO(
                        p.getId(),
                        p.getNome(),
                        p.getDescricao(),
                        p.getPrecoBase(),
                        p.getEstoque(),
                        p.getSlug(),
                        p.getImagemUrl(),
                        p.getVariacoes().stream()
                                .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                                .toList()
                ))
                .toList();
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public Produto atualizarProduto(
            @PathVariable Long id,
            @RequestPart("produto") ProdutoDTO produtoDTO,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem
    ) {
        return produtoService.atualizarProduto(id, produtoDTO, imagem);
    }

    // Excluir
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirProduto(@PathVariable Long id) {
        produtoService.excluirProduto(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/slug/{slug}")
    public ProdutoDTO buscarPorSlug(@PathVariable String slug) {
        Produto p = produtoRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        return new ProdutoDTO(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                p.getPrecoBase(),
                p.getEstoque(),
                p.getSlug(),
                p.getImagemUrl(),
                p.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList()
        );
    }

}
