package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.dto.UsuarioDTO;
import com.ecommerce.digitaltricks.model.StatusUsuario;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioDTO toDTO(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getStatus(),
                usuario.getRoles()
        );
    }
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UsuarioDTO> listarTodos(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Usuario> usuarios;
        if (status != null && !status.isEmpty()) {
            usuarios = usuarioRepository.findByStatus(StatusUsuario.valueOf(status), pageable);
        } else {
            usuarios = usuarioRepository.findAll(pageable);
        }

        return usuarios.map(this::toDTO);
    }

    // Criar usuário
    public Usuario criar(Usuario usuario) {
        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        // garantir prefixo ROLE_
        if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
            usuario.setRoles(
                    usuario.getRoles().stream()
                            .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase())
                            .collect(java.util.stream.Collectors.toSet())
            );
        } else {
            usuario.setRoles(Set.of("ROLE_USER"));
        }

        return usuarioRepository.save(usuario);
    }

    // Atualizar usuário
    public Usuario atualizar(Long id, Usuario usuario) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        existente.setUsername(usuario.getUsername());
        existente.setNome(usuario.getNome());
        existente.setEmail(usuario.getEmail());
        existente.setStatus(usuario.getStatus());

        // atualizar roles
        if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
            existente.setRoles(
                    usuario.getRoles().stream()
                            .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase())
                            .collect(java.util.stream.Collectors.toSet())
            );
        }

        // atualizar senha somente se enviada
        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            existente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioRepository.save(existente);
    }

    public UsuarioDTO buscarPorUsername(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return toDTO(usuario);
    }


    public void excluir(Long id) {
        usuarioRepository.deleteById(id);
    }
}
