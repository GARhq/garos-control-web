import React from 'react';
import { Monitor, Activity, Layers, Power, Cpu, RefreshCw } from 'lucide-react';

interface GarosHeaderStatsProps {
  onlineCount: number;
  totalCount: number;
  activeImagesCount: number;
  wolCount: number;
  throughputGb: number;
  onRefresh?: () => void;
}

export const GarosHeaderStats: React.FC<GarosHeaderStatsProps> = ({
  onlineCount,
  totalCount,
  activeImagesCount,
  wolCount,
  throughputGb,
  onRefresh,
}) => {
  const onlinePct = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Active Thin Clients */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md shadow-lg group hover:border-kve-success/40 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-kve-success/5 rounded-full blur-2xl group-hover:bg-kve-success/10 transition-all" />
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-kve-success/10 rounded-xl text-kve-success border border-kve-success/20">
              <Monitor size={16} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Terminais Diskless
            </span>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-kve-success bg-kve-success/10 px-2 py-0.5 rounded-full border border-kve-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-kve-success animate-pulse" />
            {onlinePct}% ONLINE
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tight">{onlineCount}</span>
          <span className="text-xs text-slate-500 font-mono">/ {totalCount} Conectados</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-kve-success h-full transition-all duration-500 rounded-full" 
            style={{ width: `${onlinePct}%` }} 
          />
        </div>
      </div>

      {/* NFS / TFTP Throughput */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md shadow-lg group hover:border-kve-accent/40 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-kve-accent/5 rounded-full blur-2xl group-hover:bg-kve-accent/10 transition-all" />
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-kve-accent/10 rounded-xl text-kve-accent border border-kve-accent/20">
              <Activity size={16} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Vazão NFS / TFTP
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
            Local 10G
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tight">{throughputGb}</span>
          <span className="text-xs font-bold text-kve-accent uppercase font-mono">GB/s</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-mono flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-kve-accent" /> Boot de rede em alta performance
        </p>
      </div>

      {/* Declarative PXE Profiles */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md shadow-lg group hover:border-purple-500/40 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <Layers size={16} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Imagens PXE GarOS
            </span>
          </div>
          <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            DECLARATIVAS
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tight">{activeImagesCount}</span>
          <span className="text-xs text-slate-500 font-mono">Perfis Prontos</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-mono">
          Nix Store imutável centralizada
        </p>
      </div>

      {/* Wake-on-LAN Ready */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md shadow-lg group hover:border-amber-500/40 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Power size={16} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Wake-On-LAN
            </span>
          </div>
          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            DHCP LEASES
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tight">{wolCount}</span>
          <span className="text-xs text-slate-500 font-mono">MACs Registrados</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-mono">
          Disparo de Magic Packets habilitado
        </p>
      </div>
    </div>
  );
};

export default GarosHeaderStats;
