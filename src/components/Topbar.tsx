import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  Cpu, 
  Activity,
  Terminal,
  ShieldCheck,
  Zap,
  Monitor,
  LogOut,
  Settings,
  ChevronDown,
  Palette,
  Menu,
  Play,
  Pause,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { ViewType } from '../types';
import SearchOverlay from './dashboard/SearchOverlay';
import PreferencesModal from './PreferencesModal';
import GarosWebTerminalModal from './GarosWebTerminalModal';
import ToastContainer from './ToastContainer';
import { useDeviceType } from '../hooks/useDeviceType';
import { Smartphone, Laptop } from 'lucide-react';
import { useGarosStore, UserRole } from '../store/useGarosStore';

interface TopbarProps {
  currentView: ViewType;
  selectedResource?: {id: string, type: any, label: string};
  onResourceSelect?: (res: any) => void;
  thinkServerActive?: boolean;
  onThinkServerToggle?: () => void;
  onLogout?: () => void;
  onMobileMenuToggle?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ 
  currentView, 
  selectedResource, 
  onResourceSelect,
  thinkServerActive = false,
  onThinkServerToggle,
  onLogout,
  onMobileMenuToggle
}) => {
  const { activeMode, setManualOverride } = useDeviceType();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Zustand Store
  const userRole = useGarosStore((s) => s.userRole);
  const setUserRole = useGarosStore((s) => s.setUserRole);
  const panicModeActive = useGarosStore((s) => s.panicModeActive);
  const deactivatePanicMode = useGarosStore((s) => s.deactivatePanicMode);
  const isLiveFeedActive = useGarosStore((s) => s.isLiveFeedActive);
  const lastUpdateTimestamp = useGarosStore((s) => s.lastUpdateTimestamp);
  const toggleLiveFeed = useGarosStore((s) => s.toggleLiveFeed);
  const toasts = useGarosStore((s) => s.toasts);
  const removeToast = useGarosStore((s) => s.removeToast);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Panic Mode Red Emergency Global Banner */}
      {panicModeActive && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold font-mono flex items-center justify-between shadow-2xl animate-pulse z-50 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="animate-bounce" />
            <span>MODO DE PÂNICO ATIVO: FIREWALL BLOQUEADO - SESSÕES ISOLADAS EMERGENCIAIS</span>
          </div>
          <button
            onClick={deactivatePanicMode}
            className="px-3 py-1 bg-black/40 hover:bg-black/60 rounded text-[11px] uppercase tracking-wider font-extrabold border border-white/30 transition-all"
          >
            DESATIVAR PÂNICO
          </button>
        </div>
      )}

      <header className="glass h-16 flex items-center justify-between px-3 sm:px-8 z-40 shrink-0 border-b border-kve-border/40">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile Hamburger Drawer Button */}
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white md:hidden active:scale-95 transition-all"
              title="Abrir Menu Principal"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight uppercase italic flex items-center gap-2">
              <Monitor size={18} className="text-kve-accent" />
              GAROS SERVER
            </h1>
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Globe size={10} />
              <span>GAROS-01</span>
              <span className="text-slate-700">/</span>
              <span className="text-kve-accent hidden sm:inline">Diskless Controller</span>
              <span className="text-kve-accent inline sm:hidden">Diskless</span>
            </div>
          </div>

          {/* Telemetry Status & Live Feed Toggle */}
          <div className="hidden lg:flex items-center gap-4 px-4 border-l border-kve-border">
            <button
              onClick={toggleLiveFeed}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
                isLiveFeedActive
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
              }`}
              title="Alternar Atualização ao Vivo (Polling 2s)"
            >
              {isLiveFeedActive ? <Pause size={12} /> : <Play size={12} />}
              <span>{isLiveFeedActive ? 'LIVE 2s' : 'PAUSED'}</span>
              <span className="text-[10px] opacity-75 font-normal ml-1">({lastUpdateTimestamp})</span>
            </button>

            <div className="flex items-center gap-2">
              <Activity size={14} className="text-kve-success animate-pulse-soft" />
              <span className="text-xs font-mono text-slate-400">SYS: OK</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div 
            className="relative hidden md:block cursor-pointer group"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-kve-accent transition-colors" size={16} />
            <div className="bg-slate-900/50 border border-kve-border rounded-lg pl-10 pr-4 py-2 text-sm text-slate-500 w-56 transition-all group-hover:border-kve-accent/30">
               Buscar nó, regra, cota...
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-kve-border">
              /
            </div>
          </div>

          {/* Role Switcher Badge */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 text-xs font-mono font-bold">
            <span className="px-2 text-[10px] text-slate-500 uppercase tracking-widest hidden xl:inline">Papel:</span>
            {(['admin', 'operator', 'user'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setUserRole(r)}
                className={`px-2 py-1 rounded-lg uppercase text-[10px] transition-all ${
                  userRole === r
                    ? r === 'admin'
                      ? 'bg-sky-500 text-slate-950 font-extrabold shadow'
                      : r === 'operator'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                      : 'bg-emerald-500 text-slate-950 font-extrabold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Device Mode Switcher Button */}
            <button
              onClick={() => setManualOverride(activeMode === 'mobile' ? 'desktop' : 'mobile')}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                activeMode === 'mobile'
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                  : 'bg-slate-900 border-slate-700 text-sky-400 hover:text-white'
              }`}
              title="Alternar entre Modo PC e Mobile"
            >
              {activeMode === 'mobile' ? (
                <>
                  <Smartphone size={14} className="text-purple-400 animate-pulse" />
                  <span className="hidden sm:inline">Mobile</span>
                </>
              ) : (
                <>
                  <Laptop size={14} className="text-sky-400" />
                  <span className="hidden sm:inline">Desktop</span>
                </>
              )}
            </button>

            {/* Preferences Button */}
            <button 
              onClick={() => setIsPreferencesOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-kve-accent"
              title="Preferências & Temas Visuais"
            >
              <Settings size={18} />
            </button>

            {/* Web Terminal Button */}
            <button 
              onClick={() => setIsTerminalOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-kve-accent relative"
              title="Terminal Web Interativo"
            >
              <Terminal size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-kve-success rounded-full" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 ml-1 p-1 pr-2 rounded-lg hover:bg-slate-800 transition-colors border border-transparent hover:border-kve-border"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-kve-border">
                  AR
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-kve-border rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-kve-border/50 mb-2 bg-slate-950/40">
                      <p className="text-sm font-bold text-white truncate">Aguiar Rocha</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">aguiarrocha36@gmail.com</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-kve-accent">
                        <UserCheck size={12} />
                        <span>Papel Ativo: {userRole.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsPreferencesOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Settings size={16} className="text-slate-500" />
                      <span>Preferências & Temas</span>
                    </button>

                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsTerminalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Terminal size={16} className="text-slate-500" />
                      <span>Terminal Web Shell</span>
                    </button>

                    <div className="h-px bg-kve-border/50 my-2" />
                    
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-bold"
                    >
                      <LogOut size={16} />
                      <span>Deslogar</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overlays & Modals */}
        <SearchOverlay 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onSelect={(res) => onResourceSelect?.(res)}
        />

        <PreferencesModal
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
          onLogout={() => {
            setIsPreferencesOpen(false);
            onLogout?.();
          }}
        />

        <GarosWebTerminalModal
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
        />
      </header>

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
};

export default Topbar;
