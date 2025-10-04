package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.dto.CarrinhoDTO;
import com.ecommerce.digitaltricks.dto.CarrinhoItemDTO;
import com.ecommerce.digitaltricks.model.Carrinho;
import com.ecommerce.digitaltricks.model.CarrinhoItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CarrinhoMapper {

    public CarrinhoDTO toDTO(Carrinho carrinho) {
        List<CarrinhoItemDTO> itensDTO = carrinho.getItens().stream()
                .map(this::toItemDTO)
                .toList();

        double total = itensDTO.stream()
                .mapToDouble(CarrinhoItemDTO::subtotal)
                .sum();

        return new CarrinhoDTO(carrinho.getId(), itensDTO, total);
    }

    private CarrinhoItemDTO toItemDTO(CarrinhoItem item) {
        return new CarrinhoItemDTO(
                item.getProduto().getId(),
                item.getProduto().getNome(),
                item.getProduto().getPrecoBase(),
                item.getQuantidade(),
                item.getProduto().getPrecoBase() * item.getQuantidade(),
                item.getImagemUrl()
        );
    }
}
