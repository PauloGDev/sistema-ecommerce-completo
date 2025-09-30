# 💎 Ecommerce - Perfumes Importados

![Ecommerce](https://img.shields.io/badge/Ecommerce-Spring%20Boot%20%2B%20ReactJS-blue?style=for-the-badge\&logo=java)

Projeto completo de **Ecommerce** utilizando **Spring Boot** no backend e **ReactJS** no frontend.
Sistema com painel administrativo, gerenciamento de usuários, catálogo de perfumes importados e integração com **Stripe** para pagamentos.

---

## 🛠 Tecnologias

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge\&logo=java\&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge\&logo=spring\&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge\&logo=stripe\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)

---

## 🌟 Funcionalidades

* Cadastro, login e gerenciamento de usuários
* Painel administrativo para gerenciar produtos e pedidos
* Catálogo de perfumes importados
* Processamento de pedidos e pagamentos via **Stripe**
* Integração com banco de dados **PostgreSQL**
* Frontend moderno e responsivo em **ReactJS**

---

## 🚀 Instalação e execução

### Pré-requisitos

* Java 17+ e gradle
* Node.js 16+ e npm/yarn
* PostgreSQL (ou serviço equivalente)
* (Opcional) Docker e docker-compose

### Variáveis de ambiente (exemplo)

Crie um arquivo `.env` na raiz ou configure as variáveis no ambiente do sistema:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_XXXXXX

# Spring / Banco
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ecommerce
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=senha

# Segurança (JWT, etc.)
JWT_SECRET=umSegredoMuitoSeguro
```

> Ajuste os nomes das variáveis conforme sua configuração de `application.properties` / `application.yml` do Spring Boot.

### Backend (Spring Boot)

No terminal:

```bash
cd backend
mvn clean package
# rodar em desenvolvimento
mvn spring-boot:run

# ou rodar o jar gerado
java -jar target/*.jar
```

O backend ficará disponível em `http://localhost:8080` (padrão).

### Frontend (React)

No terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend padrão abre em `http://localhost:3000`.

Para gerar build de produção:

```bash
npm run build
```

---


## 🔐 Observações

* Não exponha a `STRIPE_SECRET_KEY` em repositórios públicos.
* Verifique `application.yml` / `application.properties` para sincronizar nomes de variáveis e `datasource`.
* Se usar CORS no backend, ajuste para permitir `http://localhost:5173` em dev.

---

## 📬 Contato

[Digital Tricks](https://digitaltricks.com.br)

---
