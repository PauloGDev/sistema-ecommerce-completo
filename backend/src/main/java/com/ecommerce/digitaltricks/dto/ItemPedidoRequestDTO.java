package com.ecommerce.digitaltricks.dto;

public record ItemPedidoRequestDTO(
        Long produtoId,
        String nomeProduto,
        Integer quantidade,
        Double precoUnitario,
        Long variacaoId
) {}