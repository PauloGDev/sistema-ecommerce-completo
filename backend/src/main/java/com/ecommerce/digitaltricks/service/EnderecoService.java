package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.model.Endereco;
import com.ecommerce.digitaltricks.model.Perfil;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.repository.EnderecoRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.repository.PerfilRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;

    public EnderecoService(EnderecoRepository enderecoRepository,
                           UsuarioRepository usuarioRepository,
                           PerfilRepository perfilRepository) {
        this.enderecoRepository = enderecoRepository;
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
    }

    public List<Endereco> listarEnderecos(Long usuarioId) {
        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        return enderecoRepository.findByPerfilUsuarioId(perfil.getId());
    }

    public Endereco adicionarEndereco(Long usuarioId, Endereco endereco) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        endereco.setPerfil(perfil);

        // Se for o primeiro endereço do perfil, define como padrão automaticamente
        if (enderecoRepository.findByPerfilUsuarioId(perfil.getId()).isEmpty()) {
            endereco.setPadrao(true);
        }

        return enderecoRepository.save(endereco);
    }

    public Endereco definirEnderecoPadrao(Long usuarioId, Long enderecoId) {
        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        List<Endereco> enderecos = enderecoRepository.findByPerfilUsuarioId(perfil.getId());

        if (enderecos.isEmpty()) {
            throw new RuntimeException("Nenhum endereço encontrado");
        }

        // desmarca todos
        for (Endereco e : enderecos) {
            if (e.isPadrao()) {
                e.setPadrao(false);
                enderecoRepository.save(e);
            }
        }

        // marca o escolhido como padrão
        Endereco endereco = enderecos.stream()
                .filter(e -> e.getId().equals(enderecoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        endereco.setPadrao(true);
        return enderecoRepository.save(endereco);
    }
}
