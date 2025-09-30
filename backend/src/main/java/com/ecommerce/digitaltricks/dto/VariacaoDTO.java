package com.ecommerce.digitaltricks.dto;

import com.ecommerce.digitaltricks.model.Variacao;

public record VariacaoDTO(Long id, String nome, Double preco, Integer estoque) {
    public Variacao toEntity() {
        Variacao v = new Variacao();
        v.setId(id);
        v.setNome(nome);
        v.setPreco(preco);
        v.setEstoque(estoque);
        return v;
    }
}
