# garos-control-web

Frontend web do **garos-control** — painel de gestão do sistema operacional diskless [garos](https://github.com/garos/garos) baseado em NixOS.

## O que é

Aplicação React 19 + Vite + TypeScript + TailwindCSS que serve a interface do painel de gerenciamento de **estações diskless** (estações sem disco local que bootam via PXE/iPXE e montam root via NFS do servidor garos-server).

## Funcionalidades

- **Dashboard** com métricas em tempo real, feed de atividades e status do cluster
- **Estações Diskless** — monitoramento de hardware, heartbeat, ações de WoL/reboot/shutdown/reimage em lote
- **Gestão de Estações** — árvore de imagens PXE, NFS exports, snapshots BTRFS
- **Serviços & Daemons** — controle de Systemd/Docker/PXE/NFS/TFTP/DHCP
- **Armazenamento & NFS** — pool BTRFS, scrub, drives SMART, snapshots
- **Rede & Subredes** — firewall NFTables, modo pânico, conexões ativas
- **Telemetria & Métricas** — gráficos CPU/RAM/Network/IO com SLA
- **Usuários & Permissões** — cotas, roles, soft delete
- **Logs & Auditoria** — viewer de journald com filtros
- **Configurações** — rede, DHCP, PXE, AD (roadmap), backup

## Stack

- **React 19** + **TypeScript estrito**
- **Vite 6** como bundler/dev server
- **TailwindCSS v4** + tokens customizados do tema garos
- **Zustand** (state) + **React Router 7** (rotas)
- **Recharts** (gráficos) + **Lucide React** (ícones) + **Motion** (animações)
- **react-grid-layout** (dashboard com widgets arrastáveis)
- **Express** (backend mínimo, proxy/serve) rodando via `tsx server.ts`

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Setup de env (opcional — só se for usar Gemini no painel)
cp .env.example .env
# Editar .env e adicionar GEMINI_API_KEY

# 3. Rodar dev server (porta 3000)
npm run dev
```

Acesse http://localhost:3000

## Build de produção

```bash
npm run build
npm run preview  # serve dist/
```

## Estrutura de pastas

```
src/
├── App.tsx                 # Root component, roteamento, auth gate
├── main.tsx                # Entry point React
├── index.css               # Tailwind imports + tokens CSS do tema garos
├── types.ts                # Tipos compartilhados (Node, User, Image, etc)
├── defaultDashboardLayout.ts
├── components/
│   ├── Sidebar.tsx         # Sidebar principal
│   ├── Topbar.tsx          # Topbar
│   ├── BackgroundMosaic.tsx
│   ├── ContextMenu.tsx
│   ├── Modal.tsx
│   ├── PreferencesModal.tsx
│   ├── ToastContainer.tsx
│   ├── KveCard.tsx
│   ├── MobileBottomNav.tsx
│   ├── GarosWebTerminalModal.tsx
│   ├── dashboard/          # Widgets arrastáveis do dashboard
│   ├── garos/              # Componentes específicos do garos
│   └── nos/                # Componentes de estações (Node)
├── views/                  # Páginas principais
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Nodes.tsx           # Tela de Estações Diskless
│   ├── Users.tsx
│   ├── Services.tsx
│   ├── Storage.tsx
│   ├── Monitoring.tsx
│   ├── Gateway.tsx
│   ├── Logs.tsx
│   ├── Settings.tsx
│   ├── ThinkServer.tsx     # Árvore de recursos
│   └── ResourceView.tsx    # Detalhe de recurso (estação, imagem, etc)
├── store/                  # Zustand stores
│   └── useGarosStore.ts
├── hooks/
│   ├── useDeviceType.ts
│   ├── useGarosRealtime.ts
│   └── useDashboardLayout.ts
├── services/
│   └── api.ts
└── utils/
    └── theme.ts
```

## Temas

O tema escuro segue os tokens definidos no [BRANDING.md do garos](https://github.com/garos/garos/blob/main/BRANDING.md):

- `--bg-base: #0a0e1a`
- `--bg-elevated: #131826`
- `--bg-card: #1a2030`
- `--accent-cyan: #06b6d4`
- `--accent-blue: #3b82f6`
- `--success: #10b981`
- `--warning: #f59e0b`
- `--danger: #ef4444`

Definidos em `tailwind.config.ts` como `kve-bg`, `kve-accent`, `kve-indigo`, etc (legado, em migração para `garos-*`).

## Integração com o backend

Por enquanto, o `server.ts` deste projeto serve um backend Express mínimo (legado). A migração para o backend Rust `garos-control-api` (Axum + sqlx + ldap3) está em curso.

## Licença

MIT — Veja [LICENSE](LICENSE)
