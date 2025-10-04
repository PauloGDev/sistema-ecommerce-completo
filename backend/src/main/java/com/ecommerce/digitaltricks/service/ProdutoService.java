package com.ecommerce.digitaltricks.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.digitaltricks.dto.ProdutoDTO;
import com.ecommerce.digitaltricks.model.Categoria;
import com.ecommerce.digitaltricks.model.ItemPedido;
import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final Cloudinary cloudinary;
    private final PedidoRepository pedidoRepository;

    public ProdutoService(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository, Cloudinary cloudinary, PedidoRepository pedidoRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.cloudinary = cloudinary;
        this.pedidoRepository = pedidoRepository;
    }

    // Buscar produto por ID
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
    }

    // Criar produto
    public Produto criarProduto(ProdutoDTO dto, MultipartFile imagem) {
        Produto produto = new Produto();
        produto.setNome(dto.nome());
        produto.setSlug(gerarSlug(dto.nome()));
        produto.setDescricao(dto.descricao());
        produto.setPrecoBase(dto.precoBase());
        produto.setEstoque(dto.estoque());

        // 🔹 Categorias
        if (dto.categorias() != null) {
            List<Categoria> categorias = dto.categorias().stream()
                    .map(nome -> categoriaRepository.findByNome(nome)
                            .orElseGet(() -> categoriaRepository.save(new Categoria(nome))))
                    .toList();
            produto.setCategorias(categorias);
        }

        // 🔹 Imagem
        if (imagem != null && !imagem.isEmpty()) {
            try {
                atualizarImagem(produto, imagem);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao enviar imagem", e);
            }
        }

        // 🔹 Variações
        if (dto.variacoes() != null) {
            dto.variacoes().forEach(v -> {
                var variacao = v.toEntity();
                variacao.setProduto(produto);
                produto.getVariacoes().add(variacao);
            });
        }

        return produtoRepository.save(produto);
    }


    // Listar todos
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public Produto atualizarProduto(Long id, ProdutoDTO dto, MultipartFile imagem) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        produto.setNome(dto.nome());
        produto.setSlug(gerarSlug(dto.nome()));
        produto.setDescricao(dto.descricao());
        produto.setPrecoBase(dto.precoBase());
        produto.setEstoque(dto.estoque());

        if (dto.categorias() != null) {
            List<Categoria> categorias = dto.categorias().stream()
                    .map(nome -> categoriaRepository.findByNome(nome)
                            .orElseGet(() -> categoriaRepository.save(new Categoria(nome))))
                    .toList();

            produto.setCategorias(categorias);
        }


        if (imagem != null && !imagem.isEmpty()) {
            try {
                atualizarImagem(produto, imagem);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar imagem", e);
            }
        }

        // 🔹 Se tiver variações, sobrescreve
        if (dto.variacoes() != null) {
            produto.getVariacoes().clear();
            dto.variacoes().forEach(v -> {
                var variacao = v.toEntity();
                variacao.setProduto(produto); // garantir relação bidirecional
                produto.getVariacoes().add(variacao);
            });
        }

        // 🔹 Se você quiser já adicionar categorias depois, dá pra usar dto também
        // (precisa incluir no DTO antes)

        return produtoRepository.save(produto);
    }

    // Excluir produto
    public void excluirProduto(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        // Se tem imagem no Cloudinary, deleta
        if (produto.getImagemPublicId() != null) {
            try {
                cloudinary.uploader().destroy(produto.getImagemPublicId(), ObjectUtils.emptyMap());
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao deletar imagem no Cloudinary", e);
            }
        }

        produtoRepository.deleteById(id);
    }

    // Upload/replace da imagem no Cloudinary
    private void atualizarImagem(Produto produto, MultipartFile imagem) throws IOException {
        // Se já existe imagem, deleta a antiga no Cloudinary
        if (produto.getImagemPublicId() != null) {
            cloudinary.uploader().destroy(produto.getImagemPublicId(), ObjectUtils.emptyMap());
        }

        Map uploadResult = cloudinary.uploader().upload(
                imagem.getBytes(),
                ObjectUtils.asMap("folder", "ecommerce/produtos")
        );

        produto.setImagemUrl(uploadResult.get("secure_url").toString());
        produto.setImagemPublicId(uploadResult.get("public_id").toString());
    }

    private String gerarSlug(String nome) {
        String baseSlug = nome.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");

        String slug = baseSlug;
        int contador = 2;

        while (produtoRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + contador;
            contador++;
        }

        return slug;
    }


    @Transactional
    public void atualizarProduto(Pedido pedido, String statusAnterior, String novoStatus) {
            int i = 0;
        if (!statusAnterior.equals(novoStatus)) {
            for (ItemPedido item : pedido.getItens()) {
                int finalI = i;
                Produto produto = produtoRepository.findById(item.getProdutoId())
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + pedido.getItens().get(finalI).getProdutoId()));
                i += 1;

                // Reduz estoque se o pedido não foi cancelado
                // Devolve estoque se foi cancelado
                if ("CANCELADO".equalsIgnoreCase(novoStatus)) {
                    produto.setEstoque(produto.getEstoque() + item.getQuantidade());
                }else if("CANCELADO".equalsIgnoreCase(statusAnterior)){
                    produto.setEstoque(produto.getEstoque() - item.getQuantidade());
                }

                produtoRepository.save(produto);
            }
        }
    }

}
