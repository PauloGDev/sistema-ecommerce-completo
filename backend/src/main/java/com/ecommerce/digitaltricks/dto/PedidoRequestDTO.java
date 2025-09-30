package com.ecommerce.digitaltricks.dto;

import java.util.List;

public record PedidoRequestDTO(
        Long enderecoId,
        List<ItemPedidoRequestDTO> itens,
        String nomeCompleto,
        String status,
        String cpf,
        String telefone,
        String email
) {}
