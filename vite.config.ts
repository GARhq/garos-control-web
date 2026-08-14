import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  // SECURITY (AURA-20260813-003): nunca injetar secrets no `define`.
  // Vite substitui `process.env.X` em build time, expondo o valor
  // literal no bundle do cliente (qualquer pessoa abre DevTools e vê).
  // Se Gemini for necessário no futuro, a chave deve ficar no backend
  // Rust (config do garos-control-api) e o frontend chama via /api/gemini
  // com auth, nunca direto.
  // Referência: 02-Contrato/web/AURA-20260813-003 (P0, OWASP A02).
  const env = loadEnv(mode, '.', '');
  void env; // carregado para casos legítimos que NÃO sejam secrets
  return {
    plugins: [react(), tailwindcss()],
    // NOTE: `define` removido intencionalmente. Antes continha:
    //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    // que vazava a chave no bundle do cliente (CVSS 8.6).
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
