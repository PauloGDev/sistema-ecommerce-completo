package com.ecommerce.digitaltricks.dto;

import java.util.List;

public record CarrinhoDTO(Long id, List<CarrinhoItemDTO> itens, Double total) {}

