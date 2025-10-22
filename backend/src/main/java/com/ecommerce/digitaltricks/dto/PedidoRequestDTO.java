package com.ecommerce.digitaltricks.dto;

import java.util.List;

public record PedidoRequestDTO(
        Long enderecoId,
        List<ItemPedidoRequestDTO> itens,
        double total,
        FreteDTO frete,
        String nomeCompleto,
        String cpf,
        String telefone,
        String email
) {}


