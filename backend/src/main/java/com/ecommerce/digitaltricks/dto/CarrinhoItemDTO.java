package com.ecommerce.digitaltricks.dto;

public record CarrinhoItemDTO(
        Long produtoId,
        String nomeProduto,
        Double precoUnitario,
        Integer quantidade,
        Double subtotal
) {}
