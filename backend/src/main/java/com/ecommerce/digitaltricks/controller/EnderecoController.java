package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.EnderecoDTO;
import com.ecommerce.digitaltricks.model.Endereco;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.service.EnderecoService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enderecos")
public class EnderecoController {

    private final EnderecoService enderecoService;
    private final UsuarioRepository usuarioRepository;

    public EnderecoController(EnderecoService enderecoService, UsuarioRepository usuarioRepository) {
        this.enderecoService = enderecoService;
        this.usuarioRepository = usuarioRepository;
    }

    private Long getUsuarioId(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return usuario.getId();
    }

    @GetMapping("/me")
    public List<EnderecoDTO> meusEnderecos(Authentication authentication) {
        return enderecoService.listarEnderecos(getUsuarioId(authentication))
                .stream()
                .map(this::toDTO)
                .toList();
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
                e.isPadrao()
        );
    }
}
