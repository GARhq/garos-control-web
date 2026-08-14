# INVENTORY — garos-control-web

> **Auto-gerado via script Aura em 2026-08-13.** Surface of truth do frontend.
> Source: `~/Proyectos/garos-dev/garos-control-web/`

## Visão geral

| Métrica | Valor |
|---|---|
| Linguagem | TypeScript (~5.8.2) |
| Framework UI | React 19 |
| Build tool | Vite 6 |
| Styling | Tailwind v4 (`@tailwindcss/vite`) |
| LOC total (`src/`) | 12.887 (TS/TSX/CSS) |
| Arquivos `.ts`/`.tsx` | ~80 |
| Views (rotas) | 11 |
| Components | ~40 |
| Package manager | ⚠️ **dual lockfile** (ver K-005) |
| Dependências (`package.json`) | 22 prod + 8 dev |

## Stack

- **Framework:** React 19.0 + react-dom 19
- **Roteamento:** react-router-dom 7
- **State:** Zustand 5
- **UI:** lucide-react (ícones), motion (animações), tailwind-merge, clsx
- **Layout:** react-grid-layout 2.2
- **Charts:** Recharts 3.8
- **Terminal:** xterm.js (via GarosWebTerminalModal)
- **Server dev:** Express 4.21 (custom, só dev)
- **IA client:** @google/genai 1.29 (server-side proxy)
- **TS:** typescript 5.8.2, @types/node 22, @types/express 4
- **Tooling:** vite 6, tsx 4.21, autoprefixer 10

## Estrutura de pastas

```
src/
├── main.tsx                  # Entry (16 linhas)
├── App.tsx                   # Router + App shell
├── defaultDashboardLayout.ts # Layout padrão do dashboard
├── types.ts, types/          # Types compartilhados
├── custom.d.ts, vite-env.d.ts
├── hooks/                    # Custom hooks
├── services/                 # API client (provavelmente)
├── store/                    # Zustand stores
├── utils/                    # Utilities (theme, ...)
├── assets/                   # Assets estáticos
├── components/               # ~40 components
│   ├── Sidebar.tsx
│   ├── Modal.tsx
│   ├── ToastContainer.tsx
│   ├── GarosWebTerminalModal.tsx
│   ├── PreferencesModal.tsx
│   ├── MobileBottomNav.tsx
│   ├── KveCard.tsx
│   ├── nos/                  # Node-related
│   └── dashboard/            # ~20 widgets
│       ├── CpuWidget.tsx, MemoryWidget.tsx, StorageWidget.tsx
│       ├── FirewallRulesView.tsx, PanicButton.tsx
│       ├── StorageContentView.tsx, ClusterNodesView.tsx
│       ├── TerminalConsole.tsx, NodeNetworkView.tsx
│       ├── SnapshotsView.tsx, ServicesWidget.tsx, ...
│       └── WidgetPicker.tsx, WidgetWrapper.tsx, SearchOverlay.tsx
└── views/                    # 11 top-level views
    ├── ThinkServerView.tsx (alias /node-server, /dashboard)
    ├── NodesView.tsx
    ├── UsersView.tsx
    ├── ServicesView.tsx
    ├── StorageView.tsx
    ├── MonitoringView.tsx
    ├── GatewayView.tsx
    ├── LogsView.tsx
    ├── SettingsView.tsx
    ├── ResourceViewWrapper.tsx
    └── LoginView.tsx
```

## Views / Rotas (App.tsx)

| Path | View | Notas |
|---|---|---|
| `/dashboard` ou `/node-server` | ThinkServerView | Dashboard principal |
| `/nodes` | NodesView | Lista de nodes diskless |
| `/users` | UsersView | Gestão de usuários |
| `/services` | ServicesView | Serviços systemd |
| `/storage` | StorageView | BTRFS pools |
| `/monitoring` | MonitoringView | Métricas + alertas |
| `/gateway` | GatewayView | MikroTik/OPNsense |
| `/logs` | LogsView | journald viewer |
| `/settings` | SettingsView | Config geral |
| `/resource/:type/:id` | ResourceViewWrapper | Detalhe genérico |
| `/login` (default) | LoginView | Fallback de auth |
| `*` | InitialRedirect | Rota curinga |

## Como rodar (desenvolvimento)

```bash
cd ~/Proyectos/garos-dev/garos-control-web

# Escolher package manager (linkado a K-005)
bun install         # ou npm install
bun run dev         # ou npm run dev
# → http://localhost:3000
```

Scripts disponíveis:
- `bun run dev` — Vite dev server (porta 3000)
- `bun run build` — Build prod → `dist/`
- `bun run preview` — Preview do build
- `bun run typecheck` — TypeScript check
- `bun run clean` — Remove `dist/`

## Como buildar (produção)

```bash
cd ~/Proyectos/garos-dev/garos-control-web
bun install --frozen-lockfile   # ou npm ci
bun run build                    # ou npm run build
# Output: dist/ (estático)
```

Servir `dist/` via nginx/caddy. Ver K-004 (módulo `garos-control-web.nix`).

## Pendente (cards AURA)

- AURA-20260813-004: INVENTORY ausente — AGORA CRIADO ✅
- AURA-20260813-005: i18n ausente (strings PT-BR hardcoded) — em K-007

## Lockfile situation (atenção)

⚠️ Repo tem `bun.lock` (83 KB) E `package-lock.json` (173 KB). Ver K-005 para unificação.
