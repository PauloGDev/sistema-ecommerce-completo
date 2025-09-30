package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuario(Usuario usuario);
    Page<Pedido> findByStatus(String status, Pageable pageable);
    List<Pedido> findByUsuarioId(Long usuarioId);
    Optional<Pedido> findByStripeSessionId(String stripeSessionId);
}
