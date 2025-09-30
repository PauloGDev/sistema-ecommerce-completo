package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.Carrinho;
import com.ecommerce.digitaltricks.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {
    Optional<Carrinho> findByUsuario(Usuario usuario);

    Carrinho findByUsuarioId(Long usuarioId);
}
