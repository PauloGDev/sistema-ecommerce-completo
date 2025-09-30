package com.ecommerce.digitaltricks.dto;

import java.util.List;

public record ProdutoDTO(
        Long id,
        String nome,
        String descricao,
        Double precoBase,
        Integer estoque,
        String slug,
        String imagemUrl,
        List<VariacaoDTO> variacoes
) {}
