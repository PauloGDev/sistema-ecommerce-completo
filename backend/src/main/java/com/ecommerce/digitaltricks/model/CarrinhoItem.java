package com.ecommerce.digitaltricks.model;

import jakarta.persistence.*;

@Entity
public class CarrinhoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Produto associado
    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;
    private String nomeProduto;
    private Double precoUnitario;
    private int quantidade;
    private String imagemUrl;
    @ManyToOne
    @JoinColumn(name = "variacao_id")
    private Variacao variacao;

    public CarrinhoItem() {}

    public CarrinhoItem(Produto produto, Variacao variacao, int quantidade, String imagemUrl) {
        this.produto = produto;
        this.variacao = variacao;
        this.nomeProduto = variacao.getNome();
        this.precoUnitario = variacao.getPreco();
        this.quantidade = quantidade;
        this.imagemUrl = imagemUrl;
    }

    public CarrinhoItem(Produto produto, int quantidade, String imagemUrl) {
        this.produto = produto;
        this.quantidade = quantidade;
        this.imagemUrl = imagemUrl;
    }


    // Getters e setters
    public Long getId() { return id; }
    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public Double getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(Double precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public Variacao getVariacao() {
        return variacao;
    }

    public void setVariacao(Variacao variacao) {
        this.variacao = variacao;
    }
}
