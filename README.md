# SyncQR • Um scan. Todos ligados 📲💻

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-Direitos_Reservados-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Produção-brightgreen.svg)](#)

> **SyncQR** é uma aplicação web em tempo real concebida para sincronizar leituras de códigos QR entre dispositivos (por exemplo, telemóvel e computador) de forma instantânea, com deteção de salas na mesma rede Wi-Fi e sem necessidade de registo ou instalação de aplicações nativas.

---

## ⚡ Como Funciona

1. **Deteção Inteligente na Rede Local (Wi-Fi):** Se estiveres ligado ao mesmo Wi-Fi que outros membros, o SyncQR deteta automaticamente as salas ativas e visíveis na rede local, permitindo entrar com apenas 1 clique (sem necessidade de digitar o código manualmente).
2. **Criação / Entrada na Sala:** Podes também criar uma nova sala (com opção de a tornar pública no Wi-Fi ou privada) ou introduzir um código de 6 caracteres.
3. **Leitura no Telemóvel:** Através da câmara do telemóvel (usando a API nativa de deteção ótica com *fallback* universal), faz a leitura de qualquer código QR.
4. **Sincronização em Tempo Real:** O link detetado é instantaneamente transmitido via WebSockets para todos os membros conectados na sala (computador, tablet, outros telemóveis).
5. **Abertura Automática:** Possibilidade de copiar o link com um clique ou ativar a abertura imediata num novo separador assim que for detetado.
6. **Gestão Inteligente de Recursos:** As salas sem participantes ativos são automaticamente removidas após 10 minutos de inatividade.

---

## 🚀 Funcionalidades

- 📡 **Comunicação Bidirecional em Tempo Real:** Baseada em WebSockets (Socket.io).
- 📶 **Radar de Salas na Rede Local (Wi-Fi):** Deteção e listagem automática de salas ativas na mesma rede com contagem de membros em direto.
- 🔒 **Controlo de Privacidade e Visibilidade:** Alternador para tornar salas visíveis ou privadas na rede local em tempo real.
- 📷 **Scanner Universal:** Deteção rápida com suporte para navegadores modernos e suporte legado via biblioteca auxiliar de processamento gráfico (`jsQR`).
- 👥 **Contador de Participantes Ativos:** Visualização imediata de quantas pessoas estão na mesma sessão.
- 🎨 **Interface Moderna e Responsiva:** Design escuro, fluido e adaptável a ecrãs móveis e *desktop*.
- 🧹 **Limpeza Automática:** Ciclo de expiração programada para salas abandonadas.

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Comunicação em Tempo Real:** Socket.io (WebSockets)
- **Motor de Renderização:** EJS (Embedded JavaScript templates)
- **Frontend:** Vanilla JavaScript, CSS3 Moderno (Glassmorphism, Flexbox, CSS Grid)
- **Deteção de Imagem:** BarcodeDetector API / jsQR

---

## 📦 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm (geralmente incluído com o Node.js)

### Passos de Instalação

1. Clone o repositório:
```bash
git clone https://github.com/afonsobap2006/SyncQR.git
cd SyncQR
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

4. Abra no seu navegador:
```
http://localhost:3000
```

---

## 🐳 Execução via Docker

Se preferir utilizar contentores:

```bash
docker compose up -d --build
```

O serviço ficará acessível na porta `3000`.

---

## 📁 Estrutura de Ficheiros

```
SyncQR/
├── public/
│   ├── css/
│   │   ├── syncqr.css          # Estilos da página inicial e radar Wi-Fi
│   │   └── syncqr-sala.css     # Estilos da sala de leitura e visibilidade
│   ├── js/
│   │   ├── syncqr.js           # Lógica de entrada, criação e polling de salas locais
│   │   └── syncqr-sala.js      # Lógica do scanner, Socket.io e visibilidade
│   └── files/
│       ├── logo-syncqr.png
│       ├── img-marca.png
│       └── syncqr-banner.png   # Banner promocional 16:9 para redes sociais (Open Graph)
├── views/
│   ├── partials/
│   │   ├── header.ejs          # Barra de navegação modular
│   │   └── footer.ejs          # Rodapé modular
│   ├── syncqr.ejs              # Página de entrada / boas-vindas com radar Wi-Fi
│   └── syncqr-sala.ejs         # Ecrã da sala ativa com controlo de visibilidade e scanner
├── data/
│   └── syncqr.json             # Registo temporário de salas
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js                   # Servidor Express + Socket.io com deteção de rede
├── LICENSE                     # Todos os direitos reservados
└── README.md
```

---

## 📄 Licença

Copyright (c) 2026 Afonso Baptista. Todos os direitos reservados.

Este software e os ficheiros associados são propriedade exclusiva de Afonso Baptista.
Não é concedida qualquer permissão para copiar, modificar, distribuir, sublicenciar ou vender este código, na totalidade ou em parte, sem autorização prévia por escrito do autor.

Desenvolvido com dedicação por [Afonso Baptista](https://afonsobaptista.com).
