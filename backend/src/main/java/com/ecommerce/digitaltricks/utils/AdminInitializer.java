package com.ecommerce.digitaltricks.utils;

import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.model.StatusUsuario;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner initAdminUser(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminUsername = "serginhoaragaoadmin";
            String adminEmail = "falecomserginhoaragao@gmail.com";

            // Verifica se já existe um admin com esse username ou email
            Optional<Usuario> existingAdmin = usuarioRepository.findByUsername(adminUsername);
            Optional<Usuario> existingByEmail = usuarioRepository.findByEmail(adminEmail);

            if (existingAdmin.isEmpty() && existingByEmail.isEmpty()) {
                Usuario admin = new Usuario();
                admin.setUsername(adminUsername);
                admin.setNome("Administrador");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("@Srg01ale0"));
                admin.setStatus(StatusUsuario.ATIVO);
                admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));

                usuarioRepository.save(admin);
                System.out.println("✅ Usuário ADMIN criado com sucesso!");
                System.out.println("📧 Email: " + adminEmail);
                System.out.println("🔐 Senha: @Srg01ale0");
            } else {
                System.out.println("ℹ️ Usuário ADMIN já existe. Nenhuma ação necessária.");
            }
        };
    }
}
