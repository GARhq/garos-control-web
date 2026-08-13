import React from 'react';
import { Monitor, Power, Terminal, Activity, FileText } from 'lucide-react';
import { ViewType } from '../types';

interface MobileBottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onOpenTerminal: () => void;
  onQuickWol: () => void;
  onlineCount?: number;
  totalCount?: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenTerminal,
  onQuickWol,
  onlineCount = 0,
  totalCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl z-40 px-2 py-1.5 flex items-center justify-around sm:hidden shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
      {/* Estações */}
      <button
        onClick={() => onViewChange('node-server')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          currentView === 'node-server' || currentView === 'dashboard'
            ? 'text-kve-accent font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Monitor size={18} />
          {onlineCount > 0 && (
            <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold bg-kve-success text-slate-950 px-1 rounded-full">
              {onlineCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Estações</span>
      </button>

      {/* WOL Ligar */}
      <button
        onClick={onQuickWol}
        className="flex flex-col items-center gap-1 p-2 rounded-xl text-amber-400 active:scale-95 transition-all"
        title="Ligar todas as máquinas via Wake-on-LAN"
      >
        <div className="p-1 rounded-lg bg-amber-500/20 border border-amber-500/40">
          <Power size={18} />
        </div>
        <span className="text-[10px] font-bold">WOL Remoto</span>
      </button>

      {/* Terminal Web */}
      <button
        onClick={onOpenTerminal}
        className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-300 active:scale-95 transition-all"
      >
        <div className="p-1 rounded-lg bg-slate-800 border border-slate-700">
          <Terminal size={18} className="text-kve-accent" />
        </div>
        <span className="text-[10px]">Terminal</span>
      </button>

      {/* Serviços */}
      <button
        onClick={() => onViewChange('services')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          currentView === 'services'
            ? 'text-kve-accent font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Activity size={18} />
        <span className="text-[10px]">Daemons</span>
      </button>

      {/* Logs */}
      <button
        onClick={() => onViewChange('logs')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          currentView === 'logs'
            ? 'text-kve-accent font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileText size={18} />
        <span className="text-[10px]">Logs</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
