package com.ecommerce.digitaltricks.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoDTO(
        Long id,
        LocalDateTime data,
        double total,
        String status,
        EnderecoDTO enderecoEntrega,
        List<ItemPedidoDTO> itens,
        String nomeCompleto,
        String cpf,
        String telefone,
        String email
) {}
