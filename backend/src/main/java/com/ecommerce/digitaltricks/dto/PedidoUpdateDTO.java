package com.ecommerce.digitaltricks.dto;

import com.ecommerce.digitaltricks.model.Endereco;
import com.ecommerce.digitaltricks.model.ItemPedido;

import java.util.List;

public record PedidoUpdateDTO(
        Double total,
        String status,
        Endereco enderecoEntrega,
        String nomeCompleto,
        String cpf,
        String telefone,
        String email,
        String linkRastreio,
        List<ItemPedido> itens
) {}
