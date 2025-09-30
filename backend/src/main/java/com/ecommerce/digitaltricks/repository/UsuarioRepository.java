package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.StatusUsuario;
import com.ecommerce.digitaltricks.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    boolean existsByUsername(String username);
    java.util.Optional<Usuario> findByUsername(String username);
    Page<Usuario> findByStatus(StatusUsuario status, Pageable pageable);
}
