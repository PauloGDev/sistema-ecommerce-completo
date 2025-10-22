package com.ecommerce.digitaltricks.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Entity
public class Carrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento com usuário
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

    public void adicionarItemComVariacao(Produto produto, Variacao variacao, int quantidade) {
        Optional<CarrinhoItem> itemExistente = this.itens.stream()
                .filter(item -> item.getVariacao() != null && item.getVariacao().getId().equals(variacao.getId()))
                .findFirst();

        if (itemExistente.isPresent()) {
            CarrinhoItem item = itemExistente.get();
            item.setQuantidade(item.getQuantidade() + quantidade);
        } else {
            CarrinhoItem novoItem = new CarrinhoItem();
            novoItem.setProduto(produto);
            novoItem.setVariacao(variacao);
            novoItem.setQuantidade(quantidade);
            novoItem.setPrecoUnitario(variacao.getPreco() != null ? variacao.getPreco() : produto.getPrecoBase());
            this.itens.add(novoItem);
        }

        calcularTotal();
    }



    public void adicionarItem(Produto produto, int quantidade) {
        for (CarrinhoItem item : itens) {
            if (item.getProduto().getId().equals(produto.getId())) {
                item.setQuantidade(item.getQuantidade() + quantidade);
                calcularTotal();
                return;
            }
        }
        itens.add(new CarrinhoItem(produto, quantidade, produto.getImagemUrl()));
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
        this.total = itens.stream()
                .mapToDouble(item -> {
                    double preco = Optional.ofNullable(item.getVariacao())
                            .map(Variacao::getPreco)
                            .orElse(Optional.ofNullable(item.getProduto().getPrecoBase()).orElse(0.0));
                    return preco * item.getQuantidade();
                })
                .sum();
    }

}
