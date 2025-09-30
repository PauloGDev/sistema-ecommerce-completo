package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.model.Carrinho;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.repository.CarrinhoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ProdutoRepository produtoRepository;

    public CarrinhoService(CarrinhoRepository carrinhoRepository, ProdutoRepository produtoRepository) {
        this.carrinhoRepository = carrinhoRepository;
        this.produtoRepository = produtoRepository;
    }

    public Carrinho criarCarrinho() {
        Carrinho carrinho = new Carrinho();
        return carrinhoRepository.save(carrinho);
    }

    private Carrinho getOrCreateCarrinho(Long carrinhoId) {
        return carrinhoRepository.findById(carrinhoId)
                .orElseGet(() -> carrinhoRepository.save(new Carrinho()));
    }

    public Carrinho adicionarItem(Long carrinhoId, Long produtoId, int quantidade) {
        Carrinho carrinho = getOrCreateCarrinho(carrinhoId);
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        carrinho.adicionarItem(produto, quantidade);
        return carrinhoRepository.save(carrinho);
    }
    public Carrinho diminuirItem(Long usuarioId, Long produtoId) {
        Carrinho carrinho = buscarCarrinho(usuarioId);

        carrinho.getItens().stream()
                .filter(item -> item.getProduto().getId().equals(produtoId))
                .findFirst()
                .ifPresent(item -> {
                    if (item.getQuantidade() > 1) {
                        item.setQuantidade(item.getQuantidade() - 1);
                    } else {
                        // Se quantidade = 1, remover item
                        carrinho.getItens().remove(item);
                    }
                });

        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho limparCarrinho(Long usuarioId) {
        Carrinho carrinho = buscarCarrinho(usuarioId);

        if (carrinho == null) {
            return null;
        }

        carrinho.getItens().clear(); // limpa os itens
        carrinho.setTotal(0.0); // zera o total
        return carrinhoRepository.save(carrinho);
    }


    public Carrinho removerItem(Long carrinhoId, Long produtoId) {
        Carrinho carrinho = getOrCreateCarrinho(carrinhoId);
        carrinho.removerItem(produtoId);
        return carrinhoRepository.save(carrinho);
    }

    public Carrinho buscarCarrinho(Long id) {
        return getOrCreateCarrinho(id);
    }
}
