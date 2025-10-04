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

    public void enviarEmail(String para, String assunto, String conteudoHtml) throws MessagingException {
        MimeMessage mensagem = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mensagem, true, "UTF-8");

        helper.setTo(para);
        helper.setSubject(assunto);
        helper.setFrom("contato@digitaltricks.com.br");
        helper.setText(conteudoHtml, true); // 🔹 "true" habilita HTML

        mailSender.send(mensagem);
    }
}
