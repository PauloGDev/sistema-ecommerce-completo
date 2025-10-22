package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.model.Categoria;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    public Categoria criarCategoria(Categoria categoria) {
        if (categoriaRepository.existsByNomeIgnoreCase(categoria.getNome())) {
            throw new RuntimeException("Já existe uma categoria com esse nome!");
        }
        return categoriaRepository.save(categoria);
    }

    public Categoria editarCategoria(Long id, Categoria categoriaAtualizada) {
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada!"));

        if (!existente.getNome().equalsIgnoreCase(categoriaAtualizada.getNome()) &&
                categoriaRepository.existsByNomeIgnoreCase(categoriaAtualizada.getNome())) {
            throw new RuntimeException("Já existe uma categoria com esse nome!");
        }

        existente.setNome(categoriaAtualizada.getNome());
        return categoriaRepository.save(existente);
    }

    @Transactional
    public void excluirCategoria(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        // Remove a categoria dos produtos que a utilizam
        List<Produto> produtos = produtoRepository.findByCategorias_Id(id);
        for (Produto produto : produtos) {
            produto.getCategorias().remove(categoria);
            produtoRepository.save(produto);
        }

        // Agora é seguro remover a categoria
        categoriaRepository.deleteById(id);
    }
}
