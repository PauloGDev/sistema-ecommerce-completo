package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.*;
import com.ecommerce.digitaltricks.model.Perfil;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.model.StatusUsuario;
import com.ecommerce.digitaltricks.repository.PerfilRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.security.JwtUtil;
import com.ecommerce.digitaltricks.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthController(AuthenticationManager authManager,
                          UsuarioRepository usuarioRepository,
                          PerfilRepository perfilRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          EmailService emailService) {
        this.authManager = authManager;
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // ============================================================
    // =============== Autenticação e Cadastro ====================
    // ============================================================

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }

        return ResponseEntity.ok(jwtUtil.extractAllClaims(token)); // retorna payload
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        request.setEmail(request.getEmail().toLowerCase());

        if (usuarioRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Usuário já está em uso!");
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email já registrado!");
        }
        if (perfilRepository.existsByCpf(request.getCpf())) {
            return ResponseEntity.badRequest().body("CPF já registrado!");
        }

        // Criar usuário
        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setEmail(request.getEmail());
        usuario.setRoles(Set.of("ROLE_USER"));
        usuario.setStatus(StatusUsuario.ATIVO);

        usuario = usuarioRepository.save(usuario);

        // Criar perfil vinculado
        Perfil perfil = new Perfil();
        perfil.setUsuario(usuario);
        perfil.setNomeCompleto(request.getNomeCompleto());
        perfil.setCpf(request.getCpf());
        perfil.setTelefone(request.getTelefone());
        perfilRepository.save(perfil);

        return ResponseEntity.ok("Usuário e Perfil criados com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtUtil.generateToken(usuario.getId(), usuario.getUsername(), usuario.getRoles());

        return ResponseEntity.ok(new AuthResponse(token, usuario.getId(), usuario.getUsername()));
    }

    // ============================================================
    // =============== Recuperação de Senha =======================
    // ============================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) throws MessagingException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String token = UUID.randomUUID().toString();
        usuario.setResetToken(token);
        usuarioRepository.save(usuario);

        // URL real para frontend
        String resetLink = "https://sublimeperfumes.com.br/reset-password?token=" + token;

        // Usa o template EmailService
        emailService.enviarRedefinicaoSenha(
                usuario.getEmail(),
                usuario.getUsername(),
                resetLink
        );

        return ResponseEntity.ok("Email de recuperação enviado!");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token,
                                           @RequestParam String novaSenha) {
        Usuario usuario = usuarioRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido ou expirado"));

        usuario.setPassword(passwordEncoder.encode(novaSenha));
        usuario.setResetToken(null);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Senha alterada com sucesso!");
    }
}
