package com.ecommerce.digitaltricks.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmail(String para, String assunto, String conteudoPrincipal) throws MessagingException {
        MimeMessage mensagem = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mensagem, true, "UTF-8");

        helper.setTo(para);
        helper.setSubject(assunto);
        helper.setFrom("contato@sublimeperfumes.com.br");
        helper.setText(gerarTemplateEmail(assunto, conteudoPrincipal), true);

        mailSender.send(mensagem);
    }

    /** Template: Confirmação de Pedido */
    public void enviarConfirmacaoPedido(String para, String nome, String numeroPedido) throws MessagingException {
        String assunto = "Pedido Confirmado! 💛 #" + numeroPedido;
        String conteudo = """
                Olá, <strong>%s</strong>!<br><br>
                Seu pedido <strong>#%s</strong> foi confirmado com sucesso. 🛍️<br>
                Em breve você receberá atualizações sobre o status do envio.<br><br>
                Agradecemos por escolher a <strong>Sublime Perfumes</strong>! 💫
                """.formatted(nome, numeroPedido);
        enviarEmail(para, assunto, conteudo);
    }

    /** Template: Pagamento Aprovado */
    public void enviarPagamentoAprovado(String para, String nome, String numeroPedido, double valor) throws MessagingException {
        String assunto = "Pagamento Recebido 💰 - Pedido #" + numeroPedido;
        String conteudo = """
                Olá, <strong>%s</strong>!<br><br>
                Recebemos o pagamento do seu pedido <strong>#%s</strong> no valor de 
                <strong>R$ %.2f</strong>.<br>
                Agora estamos preparando tudo com muito carinho! 💛<br><br>
                Assim que for enviado, você receberá o código de rastreio.
                """.formatted(nome, numeroPedido, valor).replace(".", ",");
        enviarEmail(para, assunto, conteudo);
    }

    /** Template: Pedido Enviado */
    public void enviarPedidoEnviado(String para, String nome, String numeroPedido, String codigoRastreio) throws MessagingException {
        String assunto = "Seu pedido está a caminho! 🚚 #" + numeroPedido;
        String conteudo = """
                Olá, <strong>%s</strong>!<br><br>
                Seu pedido <strong>#%s</strong> foi enviado. 🥳<br>
                Você pode acompanhar a entrega usando o código de rastreio abaixo:<br><br>
                <strong>📦 %s</strong><br><br>
                Obrigado por confiar na <strong>Sublime Perfumes</strong>! 💛
                """.formatted(nome, numeroPedido, codigoRastreio);
        enviarEmail(para, assunto, conteudo);
    }

    /** Template: Redefinição de Senha */
    public void enviarRedefinicaoSenha(String para, String nome, String linkRedefinicao) throws MessagingException {
        String assunto = "Redefinição de Senha 🔐 - Sublime Perfumes";
        String conteudo = """
                Olá, <strong>%s</strong>!<br><br>
                Recebemos uma solicitação para redefinir sua senha.<br>
                Para continuar, clique no botão abaixo:<br><br>
                <p style='text-align:center;'>
                    <a href='%s' 
                       style='display:inline-block;padding:12px 24px;background:#f5cc7a;color:#111;text-decoration:none;border-radius:10px;font-weight:600;'>
                       Redefinir Senha
                    </a>
                </p><br>
                Se você não solicitou esta ação, pode ignorar este e-mail com segurança.
                """.formatted(nome, linkRedefinicao);
        enviarEmail(para, assunto, conteudo);
    }

    /**  Template genérico (fallback) */
    public void enviarMensagemGenerica(String para, String assunto, String mensagemHtml) throws MessagingException {
        enviarEmail(para, assunto, mensagemHtml);
    }

    // =============================================================
    // =============== Template base (layout visual) ================
    // =============================================================

    private String gerarTemplateEmail(String titulo, String conteudoPrincipal) {
        return """
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Sublime Perfumes</title>
                    <style>
                        body {
                            font-family: 'Poppins', Arial, sans-serif;
                            background-color: #f6f6f9;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 30px auto;
                            background: #fff;
                            border-radius: 16px;
                            box-shadow: 0 6px 20px rgba(0,0,0,0.08);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #f5cc7a, #e8b84b);
                            color: #222;
                            text-align: center;
                            padding: 24px;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 22px;
                            font-weight: 600;
                            letter-spacing: 0.5px;
                        }
                        .content {
                            padding: 24px 30px;
                            line-height: 1.6;
                            font-size: 15px;
                            color: #444;
                        }
                        .content p {
                            margin-bottom: 14px;
                        }
                        .footer {
                            background: #f9f9f9;
                            text-align: center;
                            font-size: 13px;
                            color: #777;
                            padding: 16px;
                            border-top: 1px solid #eee;
                        }
                        .footer a {
                            color: #e0b554;
                            text-decoration: none;
                            font-weight: 500;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✨ Sublime Perfumes</h1>
                        </div>
                        <div class="content">
                            <h2 style="color:#222; font-size:18px;">%s</h2>
                            <p>%s</p>
                            <br>
                            <p style="text-align:center;">
                                <a href="https://sublimeperfumes.com.br/meus-pedidos"
                                   style="display:inline-block;padding:12px 24px;background:#f5cc7a;color:#111;text-decoration:none;border-radius:10px;font-weight:600;">
                                   Acessar Meus Pedidos
                                </a>
                            </p>
                        </div>
                        <div class="footer">
                            <p>Com carinho, equipe <strong>Sublime Perfumes 💛</strong></p>
                            <p><a href="https://sublimeperfumes.com.br">www.sublimeperfumes.com.br</a></p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(titulo, conteudoPrincipal);
    }
}
