package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.EnderecoDTO;
import com.ecommerce.digitaltricks.model.Endereco;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.service.EnderecoService;
import com.ecommerce.digitaltricks.service.PerfilService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enderecos")
public class EnderecoController {

    private final EnderecoService enderecoService;
    private final UsuarioRepository usuarioRepository;
    private final PerfilService perfilService;

    public EnderecoController(EnderecoService enderecoService, UsuarioRepository usuarioRepository, PerfilService perfilService) {
        this.enderecoService = enderecoService;
        this.usuarioRepository = usuarioRepository;
        this.perfilService = perfilService;
    }

    private Long getUsuarioId(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return usuario.getId();
    }

    @PutMapping("/{id}")
    public EnderecoDTO editarEndereco(@PathVariable Long id, @RequestBody Endereco endereco, Authentication authentication) {
        Endereco atualizado = enderecoService.editarEndereco(getUsuarioId(authentication), id, endereco);
        return toDTO(atualizado);
    }

    @DeleteMapping("/{id}")
    public void excluirEndereco(@PathVariable Long id, Authentication authentication) {
        enderecoService.excluirEndereco(getUsuarioId(authentication), id);
    }

    @GetMapping("/me")
    public List<EnderecoDTO> meusEnderecos(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return perfilService.buscarOuCriarPerfil(usuario.getId())
                .getEnderecos()
                .stream()
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
                )).toList();
    }


    @PostMapping
    public EnderecoDTO adicionarEndereco(@RequestBody Endereco endereco, Authentication authentication) {
        Endereco salvo = enderecoService.adicionarEndereco(getUsuarioId(authentication), endereco);
        return toDTO(salvo);
    }

    @PutMapping("/{id}/padrao")
    public EnderecoDTO definirPadrao(@PathVariable Long id, Authentication authentication) {
        Endereco atualizado = enderecoService.definirEnderecoPadrao(getUsuarioId(authentication), id);
        return toDTO(atualizado);
    }

    private EnderecoDTO toDTO(Endereco e) {
        return new EnderecoDTO(
                e.getId(),
                e.getLogradouro(),
                e.getNumero(),
                e.getBairro(),
                e.getCidade(),
                e.getEstado(),
                e.getCep(),
                e.getComplemento(),
                e.isPadrao()
        );
    }
}
