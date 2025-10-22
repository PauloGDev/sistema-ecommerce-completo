package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.model.Carrinho;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.model.Variacao;
import com.ecommerce.digitaltricks.repository.CarrinhoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.repository.VariacaoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ProdutoRepository produtoRepository;
    private final VariacaoRepository variacaoRepository;

    public CarrinhoService(CarrinhoRepository carrinhoRepository,
                           ProdutoRepository produtoRepository,
                           VariacaoRepository variacaoRepository) {
        this.carrinhoRepository = carrinhoRepository;
        this.produtoRepository = produtoRepository;
        this.variacaoRepository = variacaoRepository;
    }

    /**
     * Cria ou retorna o carrinho do usuário
     */
    public Carrinho criarCarrinho(Usuario usuario) {
        return carrinhoRepository.findByUsuario(usuario)
                .orElseGet(() -> {
                    Carrinho carrinho = new Carrinho();
                    carrinho.setUsuario(usuario);
                    return carrinhoRepository.save(carrinho);
                });
    }

    /**
     * Busca o carrinho de um usuário ou cria um novo
     */
    private Carrinho getOrCreateCarrinhoByUsuarioId(Long usuarioId) {
        return carrinhoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrinho carrinho = new Carrinho();
                    carrinho.setUsuario(new Usuario());
                    carrinho.getUsuario().setId(usuarioId);
                    return carrinhoRepository.save(carrinho);
                });
    }

    /**
     * Adiciona item ao carrinho do usuário
     * @param usuarioId Id do usuário
     * @param produtoId Id do produto
     * @param variacaoId Id da variação (opcional)
     * @param quantidade quantidade
     */
    public Carrinho adicionarItem(Long usuarioId, Long produtoId, Long variacaoId, int quantidade) {
        Carrinho carrinho = buscarCarrinho(usuarioId);

        if (variacaoId != null) {
            Variacao variacao = variacaoRepository.findById(variacaoId)
                    .orElseThrow(() -> new RuntimeException("Variação não encontrada"));
            Produto produto = variacao.getProduto();
            carrinho.adicionarItemComVariacao(produto, variacao, quantidade);
        } else {
            Produto produto = produtoRepository.findById(produtoId)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
            carrinho.adicionarItem(produto, quantidade);
        }

        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho aumentarItem(Long usuarioId, Long produtoId) {
        Carrinho carrinho = getOrCreateCarrinhoByUsuarioId(usuarioId);

        carrinho.getItens().stream()
                .filter(item -> item.getProduto().getId().equals(produtoId))
                .findFirst()
                .ifPresent(item -> {
                    item.setQuantidade(item.getQuantidade() + 1);
                });

        return carrinhoRepository.save(carrinho);
    }


    @Transactional
    public Carrinho diminuirItem(Long usuarioId, Long produtoId) {
        Carrinho carrinho = getOrCreateCarrinhoByUsuarioId(usuarioId);

        carrinho.getItens().stream()
                .filter(item -> item.getProduto().getId().equals(produtoId))
                .findFirst()
                .ifPresent(item -> {
                    if (item.getQuantidade() > 1) {
                        item.setQuantidade(item.getQuantidade() - 1);
                    } else {
                        carrinho.getItens().remove(item);
                    }
                });

        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho limparCarrinho(Long usuarioId) {
        Carrinho carrinho = getOrCreateCarrinhoByUsuarioId(usuarioId);
        carrinho.getItens().clear();
        carrinho.setTotal(0.0);
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho removerItem(Long usuarioId, Long produtoId) {
        Carrinho carrinho = getOrCreateCarrinhoByUsuarioId(usuarioId);
        carrinho.removerItem(produtoId);
        return carrinhoRepository.save(carrinho);
    }

    public Carrinho buscarCarrinho(Long usuarioId) {
        return getOrCreateCarrinhoByUsuarioId(usuarioId);
    }
}
