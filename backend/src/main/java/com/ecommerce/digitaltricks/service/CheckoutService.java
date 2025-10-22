package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.repository.CarrinhoRepository;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CheckoutService {

    private final CarrinhoRepository carrinhoRepository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final ProdutoService produtoService;

    public CheckoutService(CarrinhoRepository carrinhoRepository,
                           PedidoRepository pedidoRepository,
                           ProdutoRepository produtoRepository, ProdutoService produtoService) {
        this.carrinhoRepository = carrinhoRepository;
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.produtoService = produtoService;
    }

    /**
     * Lista pedidos com paginação e filtro por status.
     */
    public Page<Pedido> listarTodos(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("data").descending());

        if (status != null && !status.isEmpty()) {
            return pedidoRepository.findByStatus(status, pageable);
        }
        return pedidoRepository.findAll(pageable);
    }

    /**
     * Finaliza a compra e gera um pedido a partir do carrinho.
     * 🔹 Recalcula preços sempre a partir do banco (ProdutoRepository).
     */
    public Pedido finalizarCompra(Long carrinhoId, Endereco endereco) {
        Carrinho carrinho = carrinhoRepository.findById(carrinhoId)
                .orElseThrow(() -> new RuntimeException("Carrinho não encontrado"));

        if (carrinho.getItens().isEmpty()) {
            throw new RuntimeException("Carrinho vazio");
        }

        // Monta os itens do pedido com base no produto do banco
        List<ItemPedido> itensPedido = carrinho.getItens().stream()
                .map(i -> {
                    Produto produto = produtoRepository.findById(i.getProduto().getId())
                            .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + i.getProduto().getId()));

                    return new ItemPedido(
                            produto,
                            produto.getNome(),
                            i.getQuantidade(),
                            produto.getPrecoBase(),
                            produto.getImagemUrl()
                    );
                })
                .collect(Collectors.toList());

        // Calcula total sempre pelo backend
        double total = itensPedido.stream()
                .mapToDouble(item -> item.getPrecoUnitario() * item.getQuantidade())
                .sum();

        Pedido pedido = new Pedido();
        pedido.setUsuario(carrinho.getUsuario());
        pedido.setItens(itensPedido);
        pedido.setTotal(total);
        pedido.setEnderecoEntrega(endereco);
        pedido.setStatus("PENDENTE");

        // Dados do comprador (vem do perfil, pode ser sobrescrito antes do pagamento se precisar)
        if (carrinho.getUsuario().getPerfil() != null) {
            pedido.setNomeCompleto(carrinho.getUsuario().getPerfil().getNomeCompleto());
            pedido.setTelefone(carrinho.getUsuario().getPerfil().getTelefone());
            pedido.setCpf(carrinho.getUsuario().getPerfil().getCpf());
        }
        pedido.setEmail(carrinho.getUsuario().getEmail());

        Pedido salvo = pedidoRepository.save(pedido);

        // limpa o carrinho após finalizar
        carrinho.limparCarrinho();
        carrinhoRepository.save(carrinho);

        return salvo;
    }
}
