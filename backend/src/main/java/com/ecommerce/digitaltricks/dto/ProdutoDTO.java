package com.ecommerce.digitaltricks.dto;

import java.util.List;

public record ProdutoDTO(
        Long id,
        boolean ativo,
        String nome,
        String descricao,
        List<String> categorias,
        Double precoBase,
        Integer estoque,
        String slug,
        String imagemUrl,
        List<VariacaoDTO> variacoes,
        Integer pedidos,
        Double precoMinimo
) {}
