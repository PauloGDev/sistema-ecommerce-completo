package com.ecommerce.digitaltricks.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.digitaltricks.dto.ProdutoDTO;
import com.ecommerce.digitaltricks.dto.VariacaoDTO;
import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.repository.VariacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.JoinType;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final Cloudinary cloudinary;
    private final PedidoRepository pedidoRepository;
    private final VariacaoRepository variacaoRepository;

    public ProdutoService(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository, Cloudinary cloudinary, PedidoRepository pedidoRepository, VariacaoRepository variacaoRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.cloudinary = cloudinary;
        this.pedidoRepository = pedidoRepository;
        this.variacaoRepository = variacaoRepository;
    }

    public Page<Produto> listarPaginado(String search, List<String> categorias, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return produtoRepository.findByNomeContainingIgnoreCase(search, pageable);
        }

        if (categorias != null && !categorias.isEmpty()) {
            return produtoRepository.findByCategorias_NomeInIgnoreCase(categorias, pageable);
        }

        List<Produto> produtos = produtoRepository.findAll();
        produtos.stream().map(produto -> {
            produto.atualizarPrecoMinimo();
            produtoRepository.save(produto);
            return null;
        });

        return produtoRepository.findAll(pageable);
    }

    public Page<ProdutoDTO> listarPaginadoPublic(
            String search,
            List<String> categorias,
            String ordenarPor,
            int page,
            int size
    ) {
        // Definir ordenação diretamente no banco com precoMinimo
        Sort sort = switch (ordenarPor != null ? ordenarPor : "") {
            case "menorPreco" -> Sort.by(Sort.Direction.ASC, "precoMinimo");
            case "maiorPreco" -> Sort.by(Sort.Direction.DESC, "precoMinimo");
            case "nomeAsc" -> Sort.by(Sort.Direction.ASC, "nome");
            case "nomeDesc" -> Sort.by(Sort.Direction.DESC, "nome");
            default -> Sort.by(Sort.Direction.DESC, "pedidos"); // mais vendidos
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        System.out.println("Filtro: " + ordenarPor);
        Specification<Produto> spec = (root, query, cb) -> cb.isTrue(root.get("ativo"));

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("nome")), pattern));
        }

        if (categorias != null && !categorias.isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                var subquery = query.subquery(Long.class);
                var subRoot = subquery.from(Produto.class);
                var join = subRoot.join("categorias", JoinType.LEFT);

                subquery.select(subRoot.get("id"))
                        .where(join.get("nome").in(categorias))
                        .groupBy(subRoot.get("id"))
                        .having(cb.equal(cb.countDistinct(join.get("nome")), categorias.size()));

                return cb.in(root.get("id")).value(subquery);
            });
        }

        Page<Produto> produtosPage = produtoRepository.findAll(spec, pageable);
        produtosPage.stream().map(produto -> {
            produto.atualizarPrecoMinimo();
            produtoRepository.save(produto);
            return null;
        });

        List<ProdutoDTO> dtos = produtosPage.stream()
                .map(produto -> new ProdutoDTO(
                        produto.getId(),
                        produto.isAtivo(),
                        produto.getNome(),
                        produto.getDescricao(),
                        produto.getCategorias() != null
                                ? produto.getCategorias().stream().map(Categoria::getNome).toList()
                                : List.of(),
                        produto.getPrecoMinimo(),
                        produto.getEstoque(),
                        produto.getSlug(),
                        produto.getImagemUrl(),
                        produto.getVariacoes() != null
                                ? produto.getVariacoes().stream()
                                .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                                .toList()
                                : List.of(),
                        produto.getPedidos(),
                        produto.getPrecoMinimo()
                ))
                .toList();

        System.out.println("Ordenando por: " + sort);
        return new PageImpl<>(dtos, pageable, produtosPage.getTotalElements());
    }

    private ProdutoDTO mapToDTO(Produto produto) {
        double precoExibido = Optional.ofNullable(produto.getPrecoBase())
                .orElseGet(() -> produto.getVariacoes() != null && !produto.getVariacoes().isEmpty()
                        ? produto.getVariacoes().stream()
                        .map(Variacao::getPreco)
                        .filter(Objects::nonNull)
                        .min(Double::compareTo)
                        .orElse(0.0)
                        : 0.0);

        return new ProdutoDTO(
                produto.getId(),
                produto.isAtivo(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getCategorias() != null
                        ? produto.getCategorias().stream().map(Categoria::getNome).toList()
                        : List.of(),
                precoExibido,
                produto.getEstoque(),
                produto.getSlug(),
                produto.getImagemUrl(),
                produto.getVariacoes() != null
                        ? produto.getVariacoes().stream()
                        .map(v -> new VariacaoDTO(v.getId(), v.getNome(), v.getPreco(), v.getEstoque()))
                        .toList()
                        : List.of(),
                produto.getPedidos(),
                produto.getPrecoMinimo()
        );
    }

    public List<Produto> buscarTop10PorCategoria(String categoria, int limit) {
        List<Produto> maisVendidos = produtoRepository
                .findMaisVendidosPorCategoria(categoria, PageRequest.of(0, limit));

        int faltando = limit - maisVendidos.size();

        if (faltando > 0) {
            List<Produto> naoVendidos = produtoRepository
                    .findNaoVendidosPorCategoria(categoria, PageRequest.of(0, faltando));

            List<Long> idsExistentes = maisVendidos.stream().map(Produto::getId).toList();
            naoVendidos.removeIf(p -> idsExistentes.contains(p.getId()));

            maisVendidos = new ArrayList<>(maisVendidos);
            maisVendidos.addAll(naoVendidos);
        }

        return maisVendidos;
    }


    // Buscar produto por ID
    public Produto buscarPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
        produto.atualizarPrecoMinimo();
        produtoRepository.saveAndFlush(produto);
        return produto;
    }

    // Criar produto
    public Produto criarProduto(ProdutoDTO dto, MultipartFile imagem) {
        Produto produto = new Produto();
        produto.setNome(dto.nome());
        produto.setSlug(gerarSlug(dto.nome()));
        produto.setDescricao(dto.descricao());
        produto.setPrecoBase(dto.precoBase());
        produto.setEstoque(dto.estoque());

        // Categorias
        if (dto.categorias() != null) {
            List<Categoria> categorias = dto.categorias().stream()
                    .map(nome -> categoriaRepository.findByNomeIgnoreCase(nome)
                            .orElseGet(() -> categoriaRepository.save(new Categoria(nome))))
                    .toList();
            produto.setCategorias(categorias);
        }

        // Imagem
        if (imagem != null && !imagem.isEmpty()) {
            try {
                atualizarImagem(produto, imagem);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao enviar imagem", e);
            }
        }

        // Variações
        if (dto.variacoes() != null) {
            dto.variacoes().forEach(v -> {
                var variacao = v.toEntity();
                variacao.setProduto(produto);
                produto.getVariacoes().add(variacao);
            });
        }
        produto.atualizarPrecoMinimo();
        return produtoRepository.saveAndFlush(produto);
    }

    @Transactional
    public Produto alterarStatus(Long id, boolean ativo) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
        produto.setAtivo(ativo);
        produto.atualizarPrecoMinimo();
        return produtoRepository.saveAndFlush(produto);
    }

    public List<Produto> listarTodos() {
        List<Produto> produtos = produtoRepository.findAll();
        produtos.forEach(p -> {
            p.atualizarPrecoMinimo();
            produtoRepository.saveAndFlush(p);
        });
        return produtos;
    }


    public void atualizarPedidosProduto(Long id){
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
        produto.setId(produto.getId());
        produto.setPedidos(produto.getPedidos() + 1);
        produto.atualizarPrecoMinimo();
        produtoRepository.saveAndFlush(produto);
    }

    @Transactional
    public Produto atualizarProduto(Long id, ProdutoDTO dto, MultipartFile imagem) {
        Produto produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produtoExistente.setNome(dto.nome());
        produtoExistente.setDescricao(dto.descricao());
        produtoExistente.setPrecoBase(dto.precoBase());
        produtoExistente.setEstoque(dto.estoque());
        if (dto.categorias() != null) {
            List<Categoria> categorias = dto.categorias().stream()
                    .map(nome -> categoriaRepository.findByNomeIgnoreCase(nome)
                            .orElseGet(() -> categoriaRepository.save(new Categoria(nome))))
                    .toList();
            produtoExistente.setCategorias(categorias);
        }

        try {
            atualizarImagem(produtoExistente, imagem);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao enviar imagem", e);
        }

        // Atualiza variações sem criar novas instâncias "detached"
        produtoExistente.getVariacoes().clear();
        for (VariacaoDTO vDto : dto.variacoes()) {
            Variacao variacao;
            if (vDto.id() != null) {
                variacao = variacaoRepository.findById(vDto.id())
                        .orElseThrow(() -> new RuntimeException("Variação não encontrada"));
            } else {
                variacao = new Variacao();
            }
            variacao.setNome(vDto.nome());
            variacao.setPreco(vDto.preco());
            variacao.setEstoque(vDto.estoque());
            variacao.setProduto(produtoExistente);
            produtoExistente.getVariacoes().add(variacao);
        }
        produtoExistente.atualizarPrecoMinimo();
        return produtoRepository.saveAndFlush(produtoExistente);
    }

    public String excluirOuDesativarProduto(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        int temPedidos = produto.getPedidos();

        System.out.println(produto.getPedidos());

        if (temPedidos > 0) {
            produto.setAtivo(false);
            produto.atualizarPrecoMinimo();
            produtoRepository.saveAndFlush(produto);
            return "Produto desativado (havia pedidos vinculados)";
        } else {
            produtoRepository.delete(produto);
            return "Produto excluído definitivamente";
        }
    }


    private void atualizarImagem(Produto produto, MultipartFile imagem) throws IOException {
        if (imagem != null && !imagem.isEmpty()) {
            // Se já existe imagem, deleta a antiga no Cloudinary
            if (produto.getImagemPublicId() != null) {
                cloudinary.uploader().destroy(produto.getImagemPublicId(), ObjectUtils.emptyMap());
            }

            // Faz upload da nova imagem
            Map uploadResult = cloudinary.uploader().upload(
                    imagem.getBytes(),
                    ObjectUtils.asMap("folder", "ecommerce/produtos")
            );

            produto.setImagemUrl(uploadResult.get("secure_url").toString());
            produto.setImagemPublicId(uploadResult.get("public_id").toString());
        }
    }


    private String gerarSlug(String nome) {
        String baseSlug = nome.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");

        String slug = baseSlug;
        int contador = 2;

        while (produtoRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + contador;
            contador++;
        }

        return slug;
    }


    @Transactional
    public void atualizarProduto(Pedido pedido, String statusAnterior, String novoStatus) {
            int i = 0;
        if (!statusAnterior.equals(novoStatus)) {
            for (ItemPedido item : pedido.getItens()) {
                int finalI = i;
                Produto produto = produtoRepository.findById(item.getProdutoId())
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + pedido.getItens().get(finalI).getProdutoId()));
                i += 1;

                // Reduz estoque se o pedido não foi cancelado
                // Devolve estoque se foi cancelado
                if ("CANCELADO".equalsIgnoreCase(novoStatus)) {
                    produto.setEstoque(produto.getEstoque() + item.getQuantidade());
                }else if("CANCELADO".equalsIgnoreCase(statusAnterior)){
                    produto.setEstoque(produto.getEstoque() - item.getQuantidade());
                }

                produto.atualizarPrecoMinimo();
                produtoRepository.saveAndFlush(produto);
            }
        }
    }

}
