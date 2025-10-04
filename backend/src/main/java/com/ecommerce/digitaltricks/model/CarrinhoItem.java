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

    private int quantidade;
    private String imagemUrl;

    public CarrinhoItem() {}

    public CarrinhoItem(Produto produto, int quantidade,  String imagemUrl) {
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
}
