package com.ecommerce.digitaltricks.dto;

import com.ecommerce.digitaltricks.model.StatusUsuario;
import java.util.Set;

public record UsuarioDTO(
        Long id,
        String username,
        String nome,
        String email,
        StatusUsuario status,
        Set<String> roles
) {}
