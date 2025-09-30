package com.ecommerce.digitaltricks.dto;

public record ItemPedidoDTO(
        String nomeProduto,
        int quantidade,
        double precoUnitario
) {}