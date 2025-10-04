package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.ProdutoDTO;
import com.ecommerce.digitaltricks.dto.VariacaoDTO;
import com.ecommerce.digitaltricks.model.Categoria;
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
                p.getCategorias().stream().map(Categoria::getNome).toList(),
                p.getPrecoBase(),
                p.getEstoque(),
                p.getSlug(),
                p.getImagemUrl(),
                p.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList()
        );
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ProdutoDTO criarProduto(
            @RequestPart("produto") ProdutoDTO produtoDTO,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem
    ) {
        Produto novo = produtoService.criarProduto(produtoDTO, imagem);
        return new ProdutoDTO(
                novo.getId(),
                novo.getNome(),
                novo.getDescricao(),
                novo.getCategorias().stream().map(Categoria::getNome).toList(),
                novo.getPrecoBase(),
                novo.getEstoque(),
                novo.getSlug(),
                novo.getImagemUrl(),
                novo.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList()
        );
    }


    // Listar
    @GetMapping
    public List<ProdutoDTO> listar() {
        return produtoRepository.findAll().stream()
                .map(p -> new ProdutoDTO(
                        p.getId(),
                        p.getNome(),
                        p.getDescricao(),
                        p.getCategorias().stream().map(Categoria::getNome).toList(),
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
    public ProdutoDTO atualizarProduto(
            @PathVariable Long id,
            @RequestPart("produto") ProdutoDTO produtoDTO,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem
    ) {
        Produto atualizado = produtoService.atualizarProduto(id, produtoDTO, imagem);

        return new ProdutoDTO(
                atualizado.getId(),
                atualizado.getNome(),
                atualizado.getDescricao(),
                atualizado.getCategorias().stream().map(Categoria::getNome).toList(),
                atualizado.getPrecoBase(),
                atualizado.getEstoque(),
                atualizado.getSlug(),
                atualizado.getImagemUrl(),
                atualizado.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList()
        );
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
                p.getCategorias().stream().map(Categoria::getNome).toList(),
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
