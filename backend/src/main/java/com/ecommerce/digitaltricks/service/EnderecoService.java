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

    public Endereco editarEndereco(Long usuarioId, Long enderecoId, Endereco novo) {
        Endereco existente = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        if (!existente.getPerfil().getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("Acesso negado");
        }

        existente.setLogradouro(novo.getLogradouro());
        existente.setNumero(novo.getNumero());
        existente.setComplemento(novo.getComplemento());
        existente.setBairro(novo.getBairro());
        existente.setCidade(novo.getCidade());
        existente.setEstado(novo.getEstado());
        existente.setCep(novo.getCep());

        return enderecoRepository.save(existente);
    }

    public void excluirEndereco(Long usuarioId, Long enderecoId) {
        Endereco existente = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        if (!existente.getPerfil().getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("Acesso negado");
        }

        enderecoRepository.delete(existente);
    }

    public Endereco adicionarEndereco(Long usuarioId, Endereco endereco) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        endereco.setPerfil(perfil);

        // Se for o primeiro endereço do perfil, define como padrão automaticamente
        if (perfil.getEnderecos().isEmpty() || perfil.getEnderecos() == null) {
            endereco.setPadrao(true);
        }

        return enderecoRepository.save(endereco);
    }

    public Endereco definirEnderecoPadrao(Long usuarioId, Long enderecoId) {
        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        List<Endereco> enderecos = perfil.getEnderecos();

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
