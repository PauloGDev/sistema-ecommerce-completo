package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {

    Optional<Produto> findBySlug(String slug);
    Optional<Produto> findBySlugAndAtivoTrue(String slug);
    Produto getProdutoById(Long id);
    List<Produto> findByCategorias_Id(Long id);
    Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
    Page<Produto> findByCategorias_NomeInIgnoreCase(List<String> nomes, Pageable pageable);

    @Query("""
        SELECT p FROM Produto p
        JOIN p.categorias c
        WHERE c.nome = :categoria
          AND p.ativo = true
          AND p.pedidos > 0
        ORDER BY p.pedidos DESC
    """)
    List<Produto> findMaisVendidosPorCategoria(
            @Param("categoria") String categoria,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Produto p
        JOIN p.categorias c
        WHERE c.nome = :categoria
          AND p.ativo = true
          AND p.pedidos = 0
        ORDER BY p.nome ASC
    """)
    List<Produto> findNaoVendidosPorCategoria(
            @Param("categoria") String categoria,
            Pageable pageable
    );

    @Query("SELECT p FROM Produto p WHERE p.ativo = true ORDER BY p.pedidos DESC")
    List<Produto> findTopMaisVendidos(Pageable pageable);

    @Query("SELECT p FROM Produto p WHERE p.ativo = true ORDER BY p.id DESC")
    List<Produto> findTopById(Pageable pageable);
}
