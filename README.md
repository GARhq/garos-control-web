# 📊 garos-control-web

> **Painel de Controle e Dashboard Web do Sistema Operacional GAROS.**

[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

---

## 📌 Visão Geral

O **`garos-control-web`** é a interface gráfica administrativa baseada em navegador para gerenciar a infraestrutura do GAROS. Ele oferece visualização em tempo real de nós diskless, monitoramento de saúde do servidor central, orquestração de imagens netboot, controle de quotas de armazenamento BTRFS e gerenciamento do SSOT de usuários.

### Principais Módulos da Interface
- 🖥️ **Nodes (`Nodes.tsx`)**: Lista interativa do parque de estações diskless com telemetria em tempo real, estado de conectividade e ações em lote.
- 🖼️ **Publish & Imagens (`Publish.tsx`)**: Painel de gerenciamento de imagens diskless (`desktop-generic`, `desktop-lab`, etc.), histórico de builds e acionamento de rollback.
- 💾 **Storage & Quotas (`Storage.tsx`, `Quotas.tsx`)**: Inspeção visual dos subvolumes BTRFS (`@garos_homes`, `@garos_images`), quotas por usuário e saúde dos discos.
- 👤 **Usuários & Grupos (`Users.tsx`)**: Gerenciamento visual do SSOT de Identidade, associação de perfis e permissões.
- 📈 **Monitoramento & Logs (`Monitoring.tsx`, `Logs.tsx`)**: Métricas de consumo de CPU/RAM/Rede do `srv-garos` e visualizador de logs do sistema via WebSocket.
- ⚙️ **Configurações (`Settings.tsx`, `ThinkServer.tsx`)**: Ajustes de rede, repositórios Flake e status da API backend.

---

## 🏗️ Arquitetura de Componentes e Estrutura

```mermaid
graph TD
    User[Navegador Administrador] -->|React Router / Shell UI| App[App.tsx]

    subgraph Views (/src/views)
        Dash[Dashboard.tsx]
        NodesV[Nodes.tsx - Estações Diskless]
        PubV[Publish.tsx - Imagens Netboot]
        UserV[Users.tsx - Identidade SSOT]
        StorV[Storage.tsx - BTRFS & Quotas]
        LogV[Logs.tsx - Streaming WebSockets]
    end

    subgraph State & Services
        Store[Zustand Store / State]
        APIClient[services/api.ts Client REST]
        WSClient[services/ws.ts WebSockets]
    end

    App --> Dash
    App --> NodesV
    App --> PubV
    App --> UserV
    App --> StorV
    App --> LogV

    NodesV --> APIClient
    LogV --> WSClient
    APIClient --> Backend[garos-control-api :8000]
    WSClient --> Backend
```

### 📂 Estrutura de Pastas

```text
garos-control-web/
├── package.json             # Manifesto npm com React 19, Vite 6, Tailwind v4 e Lucide Icons
├── bun.lock / package-lock  # Locks de dependências
├── vite.config.ts           # Configuração de bundler Vite e servidor de desenvolvimento
├── index.html               # Entry point HTML SPA
├── INVENTORY.md             # Inventário de views e componentes
├── src/
│   ├── main.tsx             # Bootstrap do React 19
│   ├── App.tsx              # Roteamento principal e Layout Shell
│   ├── index.css            # Importações do Tailwind v4 e utilitários de tema
│   ├── views/               # Páginas completas do Dashboard (Nodes, Storage, Users, Logs, etc)
│   ├── components/          # Componentes reutilizáveis (Card, Table, Modal, Badge, Nav)
│   ├── hooks/               # Custom React Hooks (useWebSocket, useNodes, useAuth)
│   ├── services/            # Clientes de API REST e conexão WebSocket
│   └── store/               # Gerenciamento de estado global da aplicação
└── public/                  # Favicons e assets estáticos
```

---

## ⚡ Desenvolvimento Local

### 1. Requisitos
- Node.js v22+ ou Bun
- API backend (`garos-control-api`) rodando na porta `:8000` (ou ambiente mock ativado)

### 2. Comandos de Execução

```bash
# Instalar dependências
npm install

# Subir o servidor de desenvolvimento Vite com hot-reload (:3000 ou :5173)
npm run dev

# Executar a verificação de tipos TypeScript
npx tsc --noEmit

# Gerar o bundle otimizado de produção (dist/)
npm run build

# Visualizar o build de produção localmente
npm run preview
```

---

## 📄 Veja Também

- 📘 [GAROS Core Repository](file:///home/garton/Projetos/garos-dev/GAROS/README.md)
- 🌐 [GAROS Control API Service](file:///home/garton/Projetos/garos-dev/garos-control-api/README.md)
- 🧠 [Documentação de Arquitetura no Vault](file:///home/garton/Projetos/garos-dev/garos-think-vault/README.md)
