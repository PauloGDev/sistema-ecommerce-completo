package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.ProdutoDTO;
import com.ecommerce.digitaltricks.dto.ProdutoPageDTO;
import com.ecommerce.digitaltricks.dto.VariacaoDTO;
import com.ecommerce.digitaltricks.model.Categoria;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.service.ProdutoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProdutoController(ProdutoService produtoService, ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoService = produtoService;
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // Buscar produto por ID
    @GetMapping("/{id}")
    public ProdutoDTO buscarProduto(@PathVariable Long id) {
        Produto p = produtoService.buscarPorId(id);
                p.atualizarPrecoMinimo();
        produtoRepository.save(p);
        return new ProdutoDTO(
                p.getId(),
                p.isAtivo(),
                p.getNome(),
                p.getDescricao(),
                p.getCategorias().stream().map(Categoria::getNome).toList(),
                p.getPrecoBase(),
                p.getEstoque(),
                p.getSlug(),
                p.getImagemUrl(),
                p.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList(),
                p.getPedidos(),
                p.getPrecoMinimo()
        );
    }

    @GetMapping("/destaques")
    public List<ProdutoDTO> listarDestaques() {
        List<Produto> maisVendidos = produtoRepository.findTopMaisVendidos(PageRequest.of(0, 15));

        // Se não tiver 15 produtos com pedidos, completa com os de ID mais alto
        if (maisVendidos.size() < 15) {
            List<Produto> adicionais = produtoRepository.findTopById(PageRequest.of(0, 15 - maisVendidos.size()));
            adicionais.removeIf(p -> maisVendidos.contains(p));
            maisVendidos.addAll(adicionais);
        }

        return maisVendidos.stream()
                .map(p -> new ProdutoDTO(
                        p.getId(),
                        p.isAtivo(),
                        p.getNome(),
                        p.getDescricao(),
                        p.getCategorias().stream().map(Categoria::getNome).toList(),
                        p.getPrecoBase(),
                        p.getEstoque(),
                        p.getSlug(),
                        p.getImagemUrl(),
                        p.getVariacoes().stream()
                                .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                                .toList(),
                        p.getPedidos(),
                        p.getPrecoMinimo()
                ))
                .toList();
    }

    @GetMapping("/destaque-por-categoria")
    public ProdutoDTO getDestaquePorCategoria(@RequestParam String categoria) {
        // Busca o produto mais vendido ou o mais recente se não houver vendas
        List<Produto> produtos = produtoService.buscarTop10PorCategoria(categoria, 1);

        if (produtos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum produto encontrado para esta categoria");
        }

        Produto p = produtos.get(0);

        return new ProdutoDTO(
                p.getId(),
                p.isAtivo(),
                p.getNome(),
                p.getDescricao(),
                p.getCategorias().stream().map(Categoria::getNome).toList(),
                p.getPrecoBase(),
                p.getEstoque(),
                p.getSlug(),
                p.getImagemUrl(),
                p.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList(),
                p.getPedidos(),
                p.getPrecoMinimo()
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
                novo.isAtivo(),
                novo.getNome(),
                novo.getDescricao(),
                novo.getCategorias().stream().map(Categoria::getNome).toList(),
                novo.getPrecoBase(),
                novo.getEstoque(),
                novo.getSlug(),
                novo.getImagemUrl(),
                novo.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList(),
                novo.getPedidos(),
                novo.getPrecoMinimo()
        );
    }

    @GetMapping("/mais-vendidos")
    public List<ProdutoDTO> getMaisVendidosPorCategoria(
            @RequestParam String categoria,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return produtoService.buscarTop10PorCategoria(categoria, limit).stream()
                .map(p -> new ProdutoDTO(
                        p.getId(),
                        p.isAtivo(),
                        p.getNome(),
                        p.getDescricao(),
                        p.getCategorias().stream().map(c -> c.getNome()).toList(),
                        p.getPrecoBase(),
                        p.getEstoque(),
                        p.getSlug(),
                        p.getImagemUrl(),
                        p.getVariacoes().stream()
                                .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                                .toList(),
                        p.getPedidos(),
                        p.getPrecoMinimo()
                ))
                .toList();
    }

    @GetMapping("/listarFiltroShop")
    public ResponseEntity<Map<String, Object>> listarProdutosPublic(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> categoria,
            @RequestParam(defaultValue = "maisVendidos") String ordenarPor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<ProdutoDTO> produtosPage = produtoService.listarPaginadoPublic(search, categoria, ordenarPor, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("produtos", produtosPage.getContent());
        response.put("totalPaginas", produtosPage.getTotalPages());
        response.put("totalProdutos", produtosPage.getTotalElements());

        return ResponseEntity.ok(response);
    }


    @GetMapping
    public ResponseEntity<ProdutoPageDTO> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoria
    ) {
        List<String> categorias = null;
        if (categoria != null && !categoria.isEmpty()) {
            categorias = Arrays.asList(categoria.split(","));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Produto> pagina = produtoService.listarPaginado(search, categorias, pageable); // 👈 ajustado

        List<ProdutoDTO> produtos = pagina.getContent().stream()
                .map(p -> new ProdutoDTO(
                        p.getId(),
                        p.isAtivo(),
                        p.getNome(),
                        p.getDescricao(),
                        p.getCategorias().stream().map(Categoria::getNome).toList(),
                        p.getPrecoBase(),
                        p.getEstoque(),
                        p.getSlug(),
                        p.getImagemUrl(),
                        p.getVariacoes().stream()
                                .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                                .toList(),
                        p.getPedidos(),
                        p.getPrecoMinimo()
                ))
                .toList();

        return ResponseEntity.ok(
                new ProdutoPageDTO(produtos, pagina.getNumber(), pagina.getTotalPages(), pagina.getTotalElements())
        );
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<Produto> atualizarStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean ativo = body.getOrDefault("ativo", true);
        Produto produto = produtoService.alterarStatus(id, ativo);
        return ResponseEntity.ok(produto);
    }


    @PutMapping(
            value = "/{id}",
            consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8" }
    )
    public ProdutoDTO atualizarProduto(
            @PathVariable Long id,
            @RequestPart(value = "produto", required = true) ProdutoDTO produtoDTO,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem
    ) {
        Produto atualizado = produtoService.atualizarProduto(id, produtoDTO, imagem);

        return new ProdutoDTO(
                id,
                atualizado.isAtivo(),
                atualizado.getNome(),
                atualizado.getDescricao(),
                atualizado.getCategorias().stream().map(Categoria::getNome).toList(),
                atualizado.getPrecoBase(),
                atualizado.getEstoque(),
                atualizado.getSlug(),
                atualizado.getImagemUrl(),
                atualizado.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList(),
                atualizado.getPedidos(),
                atualizado.getPrecoMinimo()
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> excluirOuDesativar(@PathVariable Long id) {
        String msg = produtoService.excluirOuDesativarProduto(id);
        return ResponseEntity.ok(msg);
    }

    @GetMapping("/slug/{slug}")
    public ProdutoDTO buscarPorSlug(@PathVariable String slug) {
        Produto p = produtoRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        return new ProdutoDTO(
                p.getId(),
                p.isAtivo(),
                p.getNome(),
                p.getDescricao(),
                p.getCategorias().stream().map(Categoria::getNome).toList(),
                p.getPrecoBase(),
                p.getEstoque(),
                p.getSlug(),
                p.getImagemUrl(),
                p.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList(),
                p.getPedidos(),
                p.getPrecoMinimo()
        );
    }

}
