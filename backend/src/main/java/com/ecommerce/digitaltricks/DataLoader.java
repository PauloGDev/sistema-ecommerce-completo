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
            // ---------- Usuário ADMIN ----------
            if (!usuarioRepository.existsByUsername("admin")) {
                Usuario admin = new Usuario();
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

                Endereco endereco1 = new Endereco(
                        "Av. Central", "1000", "Centro",
                        "São Paulo", "SP", "01000-000", true, perfilAdmin
                );

                perfilAdmin.setEnderecos(List.of(endereco1));
                perfilRepository.save(perfilAdmin);

                System.out.println("✅ Usuário ADMIN criado com sucesso.");
            }

            // ---------- Usuário JOÃO ----------
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

                Endereco endereco1 = new Endereco(
                        "Rua das Flores", "123", "Centro",
                        "Rio de Janeiro", "RJ", "20000-000", true, perfilJoao
                );
                Endereco endereco2 = new Endereco(
                        "Av. Atlântica", "500", "Copacabana",
                        "Rio de Janeiro", "RJ", "22000-000", false, perfilJoao
                );

                perfilJoao.setEnderecos(List.of(endereco1, endereco2));
                perfilRepository.save(perfilJoao);

                System.out.println("✅ Usuário João criado com sucesso.");
            }

            // ---------- Usuário MARIA ----------
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

                Endereco endereco1 = new Endereco(
                        "Rua Ametista", "45", "Jardim das Rosas",
                        "Curitiba", "PR", "80000-000", true, perfilMaria
                );
                Endereco endereco2 = new Endereco(
                        "Av. Brasil", "900", "Centro",
                        "Curitiba", "PR", "80010-000", false, perfilMaria
                );

                perfilMaria.setEnderecos(List.of(endereco1, endereco2));
                perfilRepository.save(perfilMaria);

                System.out.println("✅ Usuário Maria criado com sucesso.");
            }

            // ---------- Produtos de Teste ----------
            if (produtoRepository.count() < 3) {
                Produto p1 = new Produto();
                p1.setNome("Perfume One");
                p1.setDescricao("Perfume importado");
                p1.setPrecoBase(199.90);
                p1.setEstoque(50);
                p1.setImagemUrl("https://via.placeholder.com/200");

                Produto p2 = new Produto();
                p2.setNome("Creme Facial");
                p2.setDescricao("Creme hidratante");
                p2.setPrecoBase(89.90);
                p2.setEstoque(100);
                p2.setImagemUrl("https://via.placeholder.com/200");

                Produto p3 = new Produto();
                p3.setNome("Shampoo Premium");
                p3.setDescricao("Shampoo profissional");
                p3.setPrecoBase(59.90);
                p3.setEstoque(80);
                p3.setImagemUrl("https://via.placeholder.com/200");

                produtoRepository.saveAll(List.of(p1, p2, p3));
                System.out.println("✅ Produtos criados com sucesso.");
            }

            // ---------- Produtos com Variações ----------
            if (produtoRepository.findAll().stream().noneMatch(p -> p.getNome().equals("Camiseta Premium"))) {
                Produto camiseta = new Produto();
                camiseta.setNome("Camiseta Premium");
                camiseta.setDescricao("Camiseta de algodão de alta qualidade");
                camiseta.setPrecoBase(79.90);
                camiseta.setEstoque(0); // estoque "base" não será usado diretamente
                camiseta.setImagemUrl("https://via.placeholder.com/200");

                Variacao tamP = new Variacao("Tamanho P", 79.90, 10, camiseta);
                Variacao tamM = new Variacao("Tamanho M", 79.90, 15, camiseta);
                Variacao tamG = new Variacao("Tamanho G", 79.90, 8, camiseta);

                camiseta.getVariacoes().addAll(List.of(tamP, tamM, tamG));

                produtoRepository.save(camiseta);
                System.out.println("✅ Produto 'Camiseta Premium' com variações criado.");
            }

            if (produtoRepository.findAll().stream().noneMatch(p -> p.getNome().equals("Tênis Esportivo"))) {
                Produto tenis = new Produto();
                tenis.setNome("Tênis Esportivo");
                tenis.setDescricao("Tênis leve e confortável para corrida");
                tenis.setPrecoBase(299.90);
                tenis.setEstoque(0);
                tenis.setImagemUrl("https://via.placeholder.com/200");

                Variacao corPreto = new Variacao("Cor Preto - Tamanho 40", 299.90, 5, tenis);
                Variacao corBranco = new Variacao("Cor Branco - Tamanho 42", 299.90, 7, tenis);
                Variacao corAzul = new Variacao("Cor Azul - Tamanho 41", 299.90, 4, tenis);

                tenis.getVariacoes().addAll(List.of(corPreto, corBranco, corAzul));

                produtoRepository.save(tenis);
                System.out.println("✅ Produto 'Tênis Esportivo' com variações criado.");
            }


// sempre pega os produtos já persistidos
            List<Produto> produtos = produtoRepository.findAll();
            Produto produto1 = produtos.get(0);
            Produto produto2 = produtos.size() > 1 ? produtos.get(1) : produtos.get(0);
            Produto produto3 = produtos.size() > 2 ? produtos.get(2) : produtos.get(0);


            // ---------- Carrinho para João ----------
            if (carrinhoRepository.findAll().stream()
                    .noneMatch(c -> c.getUsuario() != null && c.getUsuario().getUsername().equals("joao"))) {
                Carrinho carrinhoJoao = new Carrinho(joao);
                carrinhoJoao.adicionarItem(produto1, 2);
                carrinhoJoao.adicionarItem(produto2, 1);
                carrinhoRepository.save(carrinhoJoao);
                System.out.println("✅ Carrinho do João criado.");
            }

            // ---------- Carrinho para Maria ----------
            if (carrinhoRepository.findAll().stream()
                    .noneMatch(c -> c.getUsuario() != null && c.getUsuario().getUsername().equals("maria"))) {
                Carrinho carrinhoMaria = new Carrinho(maria);
                carrinhoMaria.adicionarItem(produto2, 3);
                carrinhoMaria.adicionarItem(produto3, 2);
                carrinhoRepository.save(carrinhoMaria);
                System.out.println("✅ Carrinho da Maria criado.");
            }

            // ---------- Pedidos de Teste ----------
            if (pedidoRepository.count() == 0) {
                // Pedido João
                Pedido pedidoJoao = new Pedido();
                pedidoJoao.setUsuario(joao);
                pedidoJoao.setStatus("PAGO");

                ItemPedido item1 = new ItemPedido(produto1.getNome(), 2, produto1.getPrecoBase());
                ItemPedido item2 = new ItemPedido(produto2.getNome(), 1, produto2.getPrecoBase());

                pedidoJoao.setItens(List.of(item1, item2));
                pedidoRepository.save(pedidoJoao);

                // Pedido Maria
                Pedido pedidoMaria = new Pedido();
                pedidoMaria.setUsuario(maria);
                pedidoMaria.setCpf("13212312312");
                pedidoMaria.setStatus("PENDENTE");

                ItemPedido item3 = new ItemPedido(produto2.getNome(), 3, produto2.getPrecoBase());
                ItemPedido item4 = new ItemPedido(produto3.getNome(), 2, produto3.getPrecoBase());

                pedidoMaria.setItens(List.of(item3, item4));
                pedidoRepository.save(pedidoMaria);

                System.out.println("✅ Pedidos criados com sucesso.");
            }
        };
    }
}
