package com.ecommerce.digitaltricks.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private Double precoBase; // preço "padrão" (só usado se não houver variações)
    private Integer estoque;  // estoque padrão

    private String imagemUrl;
    private String imagemPublicId;

    @Column(nullable = false)
    private Double precoMinimo = 0.0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int pedidos;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;

    @Column(unique = true, nullable = false)
    private String slug;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "produto_categoria",
            joinColumns = @JoinColumn(name = "produto_id"),
            inverseJoinColumns = @JoinColumn(name = "categoria_id")
    )
    private List<Categoria> categorias = new ArrayList<>();

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Variacao> variacoes = new ArrayList<>();

    public Produto() {}

    public Produto(String nome, String descricao, Double precoBase, Integer estoque, String imagemUrl, Integer pedidos) {
        this.nome = nome;
        this.descricao = descricao;
        this.precoBase = precoBase;
        this.estoque = estoque;
        this.imagemUrl = imagemUrl;
        this.pedidos = pedidos != null ? pedidos : 0;
    }

    @PrePersist
    @PreUpdate
    public void beforeSaveOrUpdate() {
        if (nome != null && (slug == null || slug.isBlank())) {
            this.slug = nome.toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-");
        }

        Double novoPrecoMinimo;

        if (variacoes != null && !variacoes.isEmpty()) {
            novoPrecoMinimo = variacoes.stream()
                    .map(Variacao::getPreco)
                    .filter(Objects::nonNull)
                    .min(Double::compareTo)
                    .orElse(0.0);
        } else {
            novoPrecoMinimo = precoBase != null ? precoBase : 0.0;
        }

        this.precoMinimo = novoPrecoMinimo;
    }

    public void atualizarPrecoMinimo() {
        if (variacoes != null && !variacoes.isEmpty()) {
            this.precoMinimo = variacoes.stream()
                    .map(Variacao::getPreco)
                    .filter(Objects::nonNull)
                    .min(Double::compareTo)
                    .orElse(0.0);
        } else {
            this.precoMinimo = precoBase != null ? precoBase : 0.0;
        }
    }

    @PostLoad
    public void atualizarPrecoMinimoAoCarregar() {
        atualizarPrecoMinimo();
    }

    // =====================
    // Getters e Setters
    // =====================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Double getPrecoBase() { return precoBase; }

    /**
     * ⚠️ Só permite definir precoBase se o produto não tiver variações.
     */
    public void setPrecoBase(Double precoBase) {
        if (variacoes == null || variacoes.isEmpty()) {
            this.precoBase = precoBase;
        }
    }

    public Integer getEstoque() { return estoque; }
    public void setEstoque(Integer estoque) { this.estoque = estoque; }

    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }

    public String getImagemPublicId() { return imagemPublicId; }
    public void setImagemPublicId(String imagemPublicId) { this.imagemPublicId = imagemPublicId; }

    public Double getPrecoMinimo() { return precoMinimo; }
    public void setPrecoMinimo(Double precoMinimo) { this.precoMinimo = precoMinimo; }

    public int getPedidos() { return pedidos; }
    public void setPedidos(int pedidos) { this.pedidos = pedidos; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public List<Categoria> getCategorias() { return categorias; }
    public void setCategorias(List<Categoria> categorias) {
        this.categorias = (categorias != null) ? new ArrayList<>(categorias) : new ArrayList<>();
    }

    public List<Variacao> getVariacoes() { return variacoes; }
    public void setVariacoes(List<Variacao> variacoes) {
        this.variacoes = (variacoes != null) ? new ArrayList<>(variacoes) : new ArrayList<>();
    }
}
