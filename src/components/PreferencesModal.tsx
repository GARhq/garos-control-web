import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Palette, 
  Bell, 
  Volume2, 
  VolumeX, 
  Globe, 
  RefreshCw, 
  ShieldCheck, 
  LogOut, 
  Check, 
  Monitor, 
  Cpu, 
  Zap,
  Sparkles
} from 'lucide-react';

import { applyTheme, getSavedPreferences, GarosPreferences, defaultPreferences } from '../utils/theme';

export type { GarosPreferences };
export { defaultPreferences };

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onPreferencesChange?: (prefs: GarosPreferences) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  onPreferencesChange,
}) => {
  const [preferences, setPreferences] = useState<GarosPreferences>(getSavedPreferences);

  const [activeTab, setActiveTab] = useState<'appearance' | 'telemetry' | 'notifications' | 'account'>('appearance');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Apply CSS theme side-effects
  useEffect(() => {
    applyTheme(preferences);
    localStorage.setItem('garos_user_preferences', JSON.stringify(preferences));
    if (onPreferencesChange) {
      onPreferencesChange(preferences);
    }
  }, [preferences]);

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof GarosPreferences>(key: K, value: GarosPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const themes = [
    { id: 'dark', name: 'Escuro Nativo (GAROS)', bg: 'bg-slate-950', border: 'border-cyan-500/50', icon: Moon },
    { id: 'light', name: 'Claro Alta Visibilidade', bg: 'bg-slate-100 text-slate-900', border: 'border-slate-300', icon: Sun },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: 'bg-black text-cyan-400', border: 'border-pink-500', icon: Sparkles },
    { id: 'slate', name: 'Grafite Minimalista', bg: 'bg-zinc-900', border: 'border-zinc-700', icon: Monitor },
  ];

  const accents = [
    { id: 'cyan', name: 'Ciano GAROS', hex: '#38bdf8', class: 'bg-sky-400' },
    { id: 'emerald', name: 'Verde Esmeralda', hex: '#10b981', class: 'bg-emerald-500' },
    { id: 'amber', name: 'Âmbar Dourado', hex: '#f59e0b', class: 'bg-amber-500' },
    { id: 'purple', name: 'Roxo Neon', hex: '#a855f7', class: 'bg-purple-500' },
    { id: 'rose', name: 'Rosa Impacto', hex: '#f43f5e', class: 'bg-rose-500' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-kve-accent/15 text-kve-accent border border-kve-accent/30">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  Preferências do Operador & Sistema
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Personalização de Tema, Telemetria, Alertas e Sessão GAROS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showSavedToast && (
                <span className="text-[10px] font-mono font-bold text-kve-success bg-kve-success/15 border border-kve-success/30 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-fadeIn">
                  <Check size={12} /> Salvo
                </span>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body with Sidebar Tabs */}
          <div className="flex flex-col md:flex-row flex-1 min-h-[380px] max-h-[75vh]">
            {/* Tabs Navigation */}
            <div className="w-full md:w-48 bg-slate-950/50 border-r border-slate-800/80 p-3 space-y-1 shrink-0">
              {[
                { id: 'appearance', label: 'Aparência & Tema', icon: Palette },
                { id: 'telemetry', label: 'Telemetria & Poll', icon: RefreshCw },
                { id: 'notifications', label: 'Alertas & Sons', icon: Bell },
                { id: 'account', label: 'Conta & Sessão', icon: ShieldCheck },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-kve-accent/15 text-kve-accent border border-kve-accent/30 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="pt-6 border-t border-slate-800/80 mt-6">
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Deslogar do Sistema</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                      Tema Visual do Painel
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {themes.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => handleUpdate('theme', th.id as any)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                            preferences.theme === th.id
                              ? 'bg-slate-800/90 border-kve-accent text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${th.bg} border border-slate-700`}>
                              <th.icon size={16} />
                            </div>
                            <span className="text-xs font-bold">{th.name}</span>
                          </div>
                          {preferences.theme === th.id && <Check size={16} className="text-kve-accent" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                      Cor de Destaque (Accent Highlight)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {accents.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => handleUpdate('accentColor', acc.id as any)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                            preferences.accentColor === acc.id
                              ? 'border-white bg-slate-800 text-white shadow-md'
                              : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${acc.class}`} />
                          <span>{acc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                      Idioma do Sistema
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'pt-BR', label: 'Português (Brasil)' },
                        { id: 'en-US', label: 'English (US)' },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => handleUpdate('language', lang.id as any)}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                            preferences.language === lang.id
                              ? 'bg-kve-accent/20 border-kve-accent text-kve-accent'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'telemetry' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                      Intervalo de Atualização das Estações (Polling)
                    </label>
                    <p className="text-xs text-slate-400">
                      Frequência com que o painel consulta o agente GAROS para obter temperatura, consumo de CPU, ping e usuários logados.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 2, label: '2s (Tempo Real)' },
                        { val: 5, label: '5s (Recomendado)' },
                        { val: 10, label: '10s (Economia)' },
                        { val: 0, label: 'Pausado' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => handleUpdate('telemetryInterval', opt.val)}
                          className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                            preferences.telemetryInterval === opt.val
                              ? 'bg-kve-accent/20 border-kve-accent text-kve-accent'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-kve-accent font-bold">
                      <Zap size={16} />
                      <span>Desempenho de Rede Otimizado</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      A telemetria do GAROS utiliza pacotes leves via UDP/HTTP para garantir que mesmo com 200+ estações ligadas simultaneamente, o consumo de banda seja inferior a 50 KB/s.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Efeitos Sonoros no Terminal</h4>
                      <p className="text-[11px] text-slate-400">Tocar sinal sonoro ao receber saída de comando ou erro de execução</p>
                    </div>
                    <button
                      onClick={() => handleUpdate('soundAlerts', !preferences.soundAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        preferences.soundAlerts ? 'bg-kve-accent' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        preferences.soundAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Alerta Térmico de Estações (&gt; 65°C)</h4>
                      <p className="text-[11px] text-slate-400">Avisar se algum terminal atingir temperatura elevada no processador</p>
                    </div>
                    <button
                      onClick={() => handleUpdate('thermalWarningSound', !preferences.thermalWarningSound)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        preferences.thermalWarningSound ? 'bg-amber-500' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        preferences.thermalWarningSound ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Notificações de Login de Usuários</h4>
                      <p className="text-[11px] text-slate-400">Exibir banner popup quando um operador se logar em uma estação física</p>
                    </div>
                    <button
                      onClick={() => handleUpdate('loginNotifications', !preferences.loginNotifications)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        preferences.loginNotifications ? 'bg-kve-success' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        preferences.loginNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">Gabriel Aguiar Rocha</h4>
                        <p className="text-xs text-slate-400 font-mono">aguiarrocha36@gmail.com</p>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold bg-kve-accent/20 text-kve-accent border border-kve-accent/40">
                        SUPERADMIN / ROOT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Servidor Atual</span>
                        <strong>GAROS-PRIMARY-01</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Sessão Iniciada em</span>
                        <strong>Hoje, 08:14 BRT</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-red-400">Encerrar Sessão de Administrador</h4>
                      <p className="text-[11px] text-slate-400">Você será redirecionado para a tela de autenticação GAROS.</p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-lg"
                    >
                      Deslogar Agora
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-500">
              GAROS OS Preferences Engine v1.2.4
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-kve-accent text-slate-950 font-extrabold text-xs rounded-xl hover:bg-sky-400 transition-colors shadow-md"
            >
              Concluído
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PreferencesModal;
