package com.ecommerce.digitaltricks.dto;

public record EnderecoDTO(
        Long id,
        String logradouro,
        String numero,
        String bairro,
        String cidade,
        String estado,
        String cep,
        String complemento,
        boolean padrao
) {}
