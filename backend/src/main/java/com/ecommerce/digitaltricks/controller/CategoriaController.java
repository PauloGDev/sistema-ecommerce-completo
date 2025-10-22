package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.CategoriaDTO;
import com.ecommerce.digitaltricks.model.Categoria;
import com.ecommerce.digitaltricks.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @GetMapping
    public List<CategoriaDTO> listar() {
        return categoriaService.listarCategorias().stream()
                .map(c -> new CategoriaDTO(c.getId(), c.getNome()))
                .toList();
    }


    @PostMapping
    public Categoria criar(@RequestBody Categoria categoria) {
        return categoriaService.criarCategoria(categoria);
    }

    @PutMapping("/{id}")
    public Categoria editar(@PathVariable Long id, @RequestBody Categoria categoria) {
        return categoriaService.editarCategoria(id, categoria);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        categoriaService.excluirCategoria(id);
    }
}
