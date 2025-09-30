package com.ecommerce.digitaltricks.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Carrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento com usuário dono do carrinho
    @OneToOne
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    // Relacionamento com itens
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "carrinho_id") // chave estrangeira nos itens
    private List<CarrinhoItem> itens = new ArrayList<>();

    private double total;

    public Carrinho() {}

    public Carrinho(Usuario usuario) {
        this.usuario = usuario;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public List<CarrinhoItem> getItens() { return itens; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setItens(List<CarrinhoItem> itens) {
        this.itens = itens;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public double getTotal() { return total; }

    public void adicionarItem(Produto produto, int quantidade) {
        for (CarrinhoItem item : itens) {
            if (item.getProduto().getId().equals(produto.getId())) {
                item.setQuantidade(item.getQuantidade() + quantidade);
                calcularTotal();
                return;
            }
        }
        itens.add(new CarrinhoItem(produto, quantidade));
        calcularTotal();
    }

    public void removerItem(Long produtoId) {
        itens.removeIf(item -> item.getProduto().getId().equals(produtoId));
        calcularTotal();
    }

    public void limparCarrinho() {
        itens.clear();
        total = 0;
    }

    public void calcularTotal() {
        total = itens.stream()
                .mapToDouble(i -> i.getProduto().getPrecoBase() * i.getQuantidade())
                .sum();
    }
}
