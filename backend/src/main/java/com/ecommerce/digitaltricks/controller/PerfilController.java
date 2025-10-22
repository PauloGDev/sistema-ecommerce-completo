package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.UsuarioPerfilDTO;
import com.ecommerce.digitaltricks.model.Perfil;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.service.PerfilService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.digitaltricks.dto.PerfilDTO;

@RestController
@RequestMapping("/api/perfis")
public class PerfilController {

    private final PerfilService perfilService;
    private final UsuarioRepository usuarioRepository;

    public PerfilController(PerfilService perfilService, UsuarioRepository usuarioRepository) {
        this.perfilService = perfilService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/me")
    public UsuarioPerfilDTO meuPerfil(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Perfil perfil = perfilService.buscarOuCriarPerfil(usuario.getId());

        return perfilService.toUsuarioPerfilDTO(usuario, perfil);
    }

    @GetMapping("/{usuarioId}")
    public UsuarioPerfilDTO buscarPerfil(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Perfil perfil = perfilService.buscarOuCriarPerfil(usuario.getId());

        return perfilService.toUsuarioPerfilDTO(usuario, perfil);
    }

    @PutMapping("/me")
    public PerfilDTO atualizarMeuPerfil(@RequestBody Perfil perfilAtualizado, Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Perfil perfil = perfilService.buscarOuCriarPerfil(usuario.getId());

        perfil.setNomeCompleto(perfilAtualizado.getNomeCompleto());
        perfil.setTelefone(perfilAtualizado.getTelefone());
        perfil.setCpf(perfilAtualizado.getCpf());

        // substitui os endereços
        perfil.getEnderecos().clear();
        if (perfilAtualizado.getEnderecos() != null) {
            perfilAtualizado.getEnderecos().forEach(e -> {
                e.setPerfil(perfil); // garantir o vínculo
                perfil.getEnderecos().add(e);
            });
        }

        return perfilService.toDTO(perfilService.atualizarPerfil(usuario.getId(), perfil));
    }


}

