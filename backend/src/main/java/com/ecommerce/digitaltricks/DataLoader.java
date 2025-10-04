package com.ecommerce.digitaltricks;

import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            UsuarioRepository usuarioRepository,
            PerfilRepository perfilRepository,
            ProdutoRepository produtoRepository,
            CarrinhoRepository carrinhoRepository,
            PedidoRepository pedidoRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            // ==========================
            // 👤 USUÁRIOS E PERFIS
            // ==========================
            Usuario admin = usuarioRepository.findByUsername("admin").orElse(null);
            if (admin == null) {
                admin = new Usuario();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setNome("Administrador do Sistema");
                admin.setEmail("admin@digitaltricks.com");
                admin.setStatus(StatusUsuario.ATIVO);
                admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));
                usuarioRepository.save(admin);

                Perfil perfilAdmin = new Perfil();
                perfilAdmin.setUsuario(admin);
                perfilAdmin.setTelefone("11999999999");
                Endereco enderecoAdmin = new Endereco(
                        "Av. Central", "1000", "Centro",
                        "São Paulo", "SP", "01000-000", true, perfilAdmin
                );
                perfilAdmin.setEnderecos(List.of(enderecoAdmin));
                perfilRepository.save(perfilAdmin);
                System.out.println("✅ Usuário ADMIN criado com sucesso.");
            }

            Usuario joao = usuarioRepository.findByUsername("joao").orElse(null);
            if (joao == null) {
                joao = new Usuario();
                joao.setUsername("joao");
                joao.setPassword(passwordEncoder.encode("123456"));
                joao.setNome("João Silva");
                joao.setEmail("joao.silva@email.com");
                joao.setStatus(StatusUsuario.ATIVO);
                joao.setRoles(Set.of("ROLE_USER"));
                usuarioRepository.save(joao);

                Perfil perfilJoao = new Perfil();
                perfilJoao.setUsuario(joao);
                perfilJoao.setTelefone("11988887777");
                perfilJoao.setEnderecos(List.of(
                        new Endereco("Rua das Flores", "123", "Centro", "Rio de Janeiro", "RJ", "20000-000", true, perfilJoao),
                        new Endereco("Av. Atlântica", "500", "Copacabana", "Rio de Janeiro", "RJ", "22000-000", false, perfilJoao)
                ));
                perfilRepository.save(perfilJoao);
                System.out.println("✅ Usuário João criado com sucesso.");
            }

            Usuario maria = usuarioRepository.findByUsername("maria").orElse(null);
            if (maria == null) {
                maria = new Usuario();
                maria.setUsername("maria");
                maria.setPassword(passwordEncoder.encode("654321"));
                maria.setNome("Maria Oliveira");
                maria.setEmail("maria.oliveira@email.com");
                maria.setStatus(StatusUsuario.ATIVO);
                maria.setRoles(Set.of("ROLE_USER"));
                usuarioRepository.save(maria);

                Perfil perfilMaria = new Perfil();
                perfilMaria.setUsuario(maria);
                perfilMaria.setTelefone("11977776666");
                perfilMaria.setEnderecos(List.of(
                        new Endereco("Rua Ametista", "45", "Jardim das Rosas", "Curitiba", "PR", "80000-000", true, perfilMaria),
                        new Endereco("Av. Brasil", "900", "Centro", "Curitiba", "PR", "80010-000", false, perfilMaria)
                ));
                perfilRepository.save(perfilMaria);
                System.out.println("✅ Usuário Maria criado com sucesso.");
            }

            // ==========================
            // 🛍️ PRODUTOS
            // ==========================
            if (produtoRepository.count() == 0) {
                Produto p1 = new Produto("Perfume One", "Perfume importado", 199.90, 50, "https://via.placeholder.com/200");
                Produto p2 = new Produto("Creme Facial", "Creme hidratante", 89.90, 100, "https://via.placeholder.com/200");
                Produto p3 = new Produto("Shampoo Premium", "Shampoo profissional", 59.90, 80, "https://via.placeholder.com/200");

                Produto camiseta = new Produto("Camiseta Premium", "Camiseta de algodão de alta qualidade", 79.90, 0, "https://via.placeholder.com/200");
                camiseta.getVariacoes().addAll(List.of(
                        new Variacao("Tamanho P", 79.90, 10, camiseta),
                        new Variacao("Tamanho M", 79.90, 15, camiseta),
                        new Variacao("Tamanho G", 79.90, 8, camiseta)
                ));

                Produto tenis = new Produto("Tênis Esportivo", "Tênis leve e confortável para corrida", 299.90, 0, "https://via.placeholder.com/200");
                tenis.getVariacoes().addAll(List.of(
                        new Variacao("Cor Preto - Tamanho 40", 299.90, 5, tenis),
                        new Variacao("Cor Branco - Tamanho 42", 299.90, 7, tenis),
                        new Variacao("Cor Azul - Tamanho 41", 299.90, 4, tenis)
                ));

                produtoRepository.saveAll(List.of(p1, p2, p3, camiseta, tenis));
                System.out.println("✅ Produtos e variações criados com sucesso.");
            }

            // ==========================
            // 🛒 CARRINHOS
            // ==========================
            Produto produto1 = produtoRepository.findAll().get(0);
            Produto produto2 = produtoRepository.findAll().get(1);
            Produto produto3 = produtoRepository.findAll().get(2);

            Usuario finalJoao = joao;
            if (carrinhoRepository.findAll().stream().noneMatch(c -> c.getUsuario() != null && c.getUsuario().equals(finalJoao))) {
                Carrinho carrinhoJoao = new Carrinho(joao);
                carrinhoJoao.adicionarItem(produto1, 2);
                carrinhoJoao.adicionarItem(produto2, 1);
                carrinhoRepository.save(carrinhoJoao);
                System.out.println("✅ Carrinho do João criado.");
            }

            Usuario finalMaria = maria;
            if (carrinhoRepository.findAll().stream().noneMatch(c -> c.getUsuario() != null && c.getUsuario().equals(finalMaria))) {
                Carrinho carrinhoMaria = new Carrinho(maria);
                carrinhoMaria.adicionarItem(produto2, 3);
                carrinhoMaria.adicionarItem(produto3, 2);
                carrinhoRepository.save(carrinhoMaria);
                System.out.println("✅ Carrinho da Maria criado.");
            }

            // ==========================
            // 📦 PEDIDOS
            // ==========================
            if (pedidoRepository.count() == 0) {
                Pedido pedidoJoao = new Pedido();
                pedidoJoao.setUsuario(joao);
                pedidoJoao.setStatus("PAGO");
                pedidoJoao.setCpf("12345678900");
                pedidoJoao.setTelefone("11988887777");
                pedidoJoao.setEmail(joao.getEmail());
                pedidoJoao.setNomeCompleto(joao.getNome());

                ItemPedido item1 = new ItemPedido(produto1, produto1.getNome(), 2, produto1.getPrecoBase(), produto1.getImagemUrl());
                ItemPedido item2 = new ItemPedido(produto2, produto2.getNome(), 1, produto2.getPrecoBase(), produto2.getImagemUrl());

                pedidoJoao.setItens(List.of(item1, item2));
                pedidoJoao.setTotal(item1.getPrecoUnitario() * item1.getQuantidade() + item2.getPrecoUnitario() * item2.getQuantidade());
                pedidoRepository.save(pedidoJoao);

                Pedido pedidoMaria = new Pedido();
                pedidoMaria.setUsuario(maria);
                pedidoMaria.setStatus("PENDENTE");
                pedidoMaria.setCpf("98765432100");
                pedidoMaria.setTelefone("11977776666");
                pedidoMaria.setEmail(maria.getEmail());
                pedidoMaria.setNomeCompleto(maria.getNome());

                ItemPedido item3 = new ItemPedido(produto2, produto2.getNome(), 3, produto2.getPrecoBase(), produto2.getImagemUrl());
                ItemPedido item4 = new ItemPedido(produto3, produto3.getNome(), 2, produto3.getPrecoBase(), produto3.getImagemUrl());

                pedidoMaria.setItens(List.of(item3, item4));
                pedidoMaria.setTotal(item3.getPrecoUnitario() * item3.getQuantidade() + item4.getPrecoUnitario() * item4.getQuantidade());
                pedidoRepository.save(pedidoMaria);

                System.out.println("✅ Pedidos de teste criados com sucesso.");
            }

            System.out.println("🚀 Banco de dados inicializado com sucesso!");
        };
    }
}
