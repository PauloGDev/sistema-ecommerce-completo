package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
    List<Endereco> findByPerfilUsuarioId(Long usuarioId);
}

