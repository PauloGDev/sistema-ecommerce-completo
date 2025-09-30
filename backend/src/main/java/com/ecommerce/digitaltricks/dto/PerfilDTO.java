package com.ecommerce.digitaltricks.dto;

import java.util.List;

public record PerfilDTO(
        Long id,
        String nomeCompleto,
        String telefone,
        List<EnderecoDTO> enderecos
) {}
