package com.ecommerce.digitaltricks.dto;

public record ItemPedidoDTO(
        Long produtoId,
        String nomeProduto,
        int quantidade,
        double precoUnitario,
        String imagemUrl
) {}