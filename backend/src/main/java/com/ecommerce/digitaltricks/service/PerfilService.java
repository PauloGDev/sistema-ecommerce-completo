package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.dto.EnderecoDTO;
import com.ecommerce.digitaltricks.dto.PerfilDTO;
import com.ecommerce.digitaltricks.dto.UsuarioPerfilDTO;
import com.ecommerce.digitaltricks.model.Perfil;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.repository.PerfilRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final UsuarioRepository usuarioRepository;

    public PerfilService(PerfilRepository perfilRepository, UsuarioRepository usuarioRepository) {
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
    }
    public PerfilDTO toDTO(Perfil perfil) {
        return new PerfilDTO(
                perfil.getId(),
                perfil.getNomeCompleto(),
                perfil.getTelefone(),
                perfil.getCpf(),
                perfil.getEnderecos() != null
                        ? perfil.getEnderecos().stream()
                        .map(e -> new EnderecoDTO(
                                e.getId(),
                                e.getLogradouro(),
                                e.getNumero(),
                                e.getBairro(),
                                e.getEstado(),
                                e.getCep(),
                                e.getCidade(),
                                e.getComplemento(),
                                e.isPadrao()
                        ))
                        .toList()
                        : List.of()
        );
    }

    public Perfil buscarOuCriarPerfil(Long usuarioId) {
        return perfilRepository.findByUsuarioId(usuarioId).orElseGet(() -> {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            Perfil novo = new Perfil();
            novo.setUsuario(usuario);
            return perfilRepository.save(novo);
        });
    }

    public Perfil atualizarPerfil(Long usuarioId, Perfil perfilAtualizado) {
        Perfil perfil = buscarOuCriarPerfil(usuarioId);

        perfil.setNomeCompleto(perfilAtualizado.getNomeCompleto());
        perfil.setTelefone(perfilAtualizado.getTelefone());

        return perfilRepository.save(perfil);
    }

    public UsuarioPerfilDTO toUsuarioPerfilDTO(Usuario usuario, Perfil perfil) {
        return new UsuarioPerfilDTO(
                usuario.getId(),
                usuario.getPerfil().getId(),
                usuario.getUsername(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getStatus(),
                usuario.getRoles(),
                perfil.getNomeCompleto(),
                perfil.getTelefone(),
                perfil.getCpf(),
                perfil.getEnderecos() != null
                        ? perfil.getEnderecos().stream()
                        .map(e -> new EnderecoDTO(
                                e.getId(),
                                e.getLogradouro(),
                                e.getNumero(),
                                e.getBairro(),
                                e.getEstado(),
                                e.getCep(),
                                e.getCidade(),
                                e.getComplemento(),
                                e.isPadrao()
                        )).toList()
                        : List.of()
        );
    }


}

