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
        String nome = item.getVariacao() != null
                ? item.getProduto().getNome() + " - " + item.getVariacao().getNome()
                : item.getProduto().getNome();

        Double preco = item.getVariacao() != null
                ? item.getVariacao().getPreco()
                : item.getProduto().getPrecoBase();

        String imagemUrl = null;
        if (item.getProduto().getImagemUrl() != null) {
            imagemUrl = item.getProduto().getImagemUrl();
        }

        return new CarrinhoItemDTO(
                item.getProduto().getId(),
                nome,
                preco,
                item.getQuantidade(),
                preco * item.getQuantidade(),
                imagemUrl
        );
    }
}
