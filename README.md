# garos-control-web

## 📌 Visão Geral
Dashboard e painel web gerencial do GAROS desenvolvido em React, TypeScript e Vite.

## ⚙️ O que esta pasta faz
- Gerenciar especificações declarativas do NixOS, módulos do sistema e receitas de build.
- Implementar componentes interativos de interface de usuário e gerenciamento de estado web.
- Manter documentadas as decisões de design, especificações de rotas e guias operacionais.

## 📂 Conteúdo e Arquivos Detalhados
- `public/`: **[Módulo]** — Subsistema e arquivos de organização do módulo `public`.
- `src/`: **[Módulo]** — Componentes visuais, hooks, páginas e rotas da interface de controle web.
- `INVENTORY.md`: **[Documentação em Markdown]** — Documento de especificação técnica abordando *INVENTORY — garos-control-web*.
- `bun.lock`: **[Arquivo do Módulo]** — Arquivo integrante do diretório (bun.lock).
- `flake.lock`: **[Trava de Dependências Flake]** — Registro determinístico com hashes e revisões exatas dos repositórios e módulos importados pelo Flake.
- `flake.nix`: **[Nix Flake Principal]** — Define as entradas (nixpkgs) e configurações de sistema () do ecossistema Nix.
- `index.html`: **[Arquivo do Módulo]** — Arquivo integrante do diretório (index.html).
- `metadata.json`: **[Arquivo do Módulo]** — Arquivo integrante do diretório (metadata.json).
- `package-lock.json`: **[Trava de Versões npm]** — Arquivo de trava que garante a instalação de versões idênticas de pacotes JavaScript/TypeScript.
- `package.json`: **[Manifesto npm Node.js]** — Define scripts de execução (`name, version, type`), metadados do projeto e dependências npm.
- `server.ts`: **[Servidor Backend Express]** — Ponto de entrada do backend em TypeScript responsável por servir a API do instalador e manipular eventos de disco.
- `tsconfig.json`: **[Arquivo do Módulo]** — Arquivo integrante do diretório (tsconfig.json).
- `vite.config.ts`: **[Componente/Módulo TS/JS]** — Implementação TypeScript/React exportando exports `defineConfig`.

## 🔄 Histórico de Mudanças Comportamentais
- **[Inicial]**: Mapeamento e documentação detalhada da estrutura inicial do módulo.
