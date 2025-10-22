package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCase(String nome);
}
