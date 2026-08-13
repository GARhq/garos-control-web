import React from 'react';
import { X, Monitor, Cpu, Activity, HardDrive, Zap, Wifi, Clock, ShieldCheck, Power, RefreshCw, Terminal, Wrench } from 'lucide-react';
import { NetbootDevice } from '../../types';
import { useGarosStore } from '../../store/useGarosStore';

interface NodeDetailDrawerProps {
  nodeMac: string | null;
  onClose: () => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({ nodeMac, onClose }) => {
  const nodes = useGarosStore((s) => s.nodes);
  const userRole = useGarosStore((s) => s.userRole);
  const addToast = useGarosStore((s) => s.addToast);
  const addAuditLog = useGarosStore((s) => s.addAuditLog);
  const currentUser = useGarosStore((s) => s.currentUser);

  if (!nodeMac) return null;

  const node = nodes.find((n) => n.mac === nodeMac);
  if (!node) return null;

  // Calculate heartbeat ping status
  const pingSeconds = node.pingMs < 1 ? 5 : Math.floor(node.pingMs * 10);
  const heartbeatStatus = node.status === 'Offline' ? 'offline' : pingSeconds < 30 ? 'green' : pingSeconds < 120 ? 'yellow' : 'red';

  const handleAction = (actionName: string) => {
    if (userRole === 'user') {
      addToast('Acesso Negado', 'Seu papel (User) não possui permissão para comandos diretos no nó.', 'danger');
      return;
    }
    addToast(`Comando (${actionName})`, `Sinal enviado para a estação ${node.hostname} (${node.mac}).`, 'success');
    addAuditLog({
      user: currentUser,
      role: userRole,
      module: 'Node Detail',
      action: `NODE_${actionName.toUpperCase()}`,
      payload: `Executed on ${node.hostname} (${node.mac})`,
      result: 'success',
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-950/95 border-l border-slate-800 backdrop-blur-2xl z-50 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Monitor size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">{node.hostname}</h3>
            <p className="text-[11px] font-mono text-slate-400">{node.mac}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-6 space-y-6">
        {/* Heartbeat & Status Badge */}
        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-400 uppercase tracking-wider">Heartbeat Ping:</span>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  heartbeatStatus === 'green'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                    : heartbeatStatus === 'yellow'
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'bg-rose-500 shadow-[0_0_8px_rgba(243,24,68,0.8)]'
                }`}
              />
              <span className="text-white">{node.pingMs} ms</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">
            {heartbeatStatus === 'green'
              ? 'Conexão em tempo real excelente (<30s). Response OK.'
              : heartbeatStatus === 'yellow'
              ? 'Latência intermediária (30s-120s).'
              : 'Sem sinal recente de heartbeat (>120s).'
            }
          </p>
        </div>

        {/* Live Gauges & Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span className="uppercase">Uso de CPU</span>
              <Cpu size={12} className="text-sky-400" />
            </div>
            <p className="text-lg font-black text-white font-mono">{node.cpuUsagePct}%</p>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-sky-400 h-full transition-all duration-500"
                style={{ width: `${node.cpuUsagePct}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span className="uppercase">Memória RAM</span>
              <Activity size={12} className="text-emerald-400" />
            </div>
            <p className="text-lg font-black text-white font-mono">{node.memUsagePct}%</p>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${node.memUsagePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hardware Details List */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            Ficha Técnica da Estação
          </h4>

          <div className="p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
              <span className="text-slate-500">Modelo Hardware:</span>
              <span className="text-white font-bold">{node.hardwareModel}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
              <span className="text-slate-500">IP de Rede:</span>
              <span className="text-sky-400 font-bold">{node.ip}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
              <span className="text-slate-500">Link de Rede:</span>
              <span className="text-emerald-400 font-bold">{node.networkLink}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
              <span className="text-slate-500">Latência NFS Root:</span>
              <span className="text-amber-400 font-bold">{node.nfsLatencyMs} ms</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
              <span className="text-slate-500">Temp CPU / Cooler:</span>
              <span className="text-rose-400 font-bold">{node.cpuTempC}°C / {node.fanSpeedRpm} RPM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Usuário Logado:</span>
              <span className="text-white font-bold">{node.currentUser} ({node.currentUserRole})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Direct Actions Footer */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('Wake-on-LAN')}
            className="py-2.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all"
          >
            <Zap size={14} />
            <span>Wake-on-LAN</span>
          </button>
          <button
            onClick={() => handleAction('Reboot')}
            className="py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw size={14} />
            <span>Reiniciar</span>
          </button>
        </div>
        <button
          onClick={() => handleAction('Shutdown')}
          className="w-full py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all"
        >
          <Power size={14} />
          <span>Desligamento Remoto</span>
        </button>
      </div>
    </div>
  );
};

export default NodeDetailDrawer;
