package com.ecommerce.digitaltricks.dto;

public record ItemPedidoDTO(
        Long produtoId,
        Long variacaoId,
        String nomeProduto,
        int quantidade,
        double precoUnitario,
        String imagemUrl
) {}