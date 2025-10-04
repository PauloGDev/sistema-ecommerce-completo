package com.ecommerce.digitaltricks.dto;

import com.ecommerce.digitaltricks.model.Categoria;

import java.util.List;

public record ProdutoDTO(
        Long id,
        String nome,
        String descricao,
        List<String> categorias,
        Double precoBase,
        Integer estoque,
        String slug,
        String imagemUrl,
        List<VariacaoDTO> variacoes
) {}
