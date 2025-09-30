package com.ecommerce.digitaltricks.dto;

import java.util.List;
import java.util.Set;
import com.ecommerce.digitaltricks.model.StatusUsuario;

public record UsuarioPerfilDTO(
        Long id,
        String username,
        String nome,
        String email,
        StatusUsuario status,
        Set<String> roles,
        String nomeCompleto,
        String telefone,
        String cpf,
        List<EnderecoDTO> enderecos
) {}
