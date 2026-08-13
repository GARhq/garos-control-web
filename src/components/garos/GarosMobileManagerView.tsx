import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  Monitor,
  Power,
  Users,
  AlertTriangle,
  Send,
  RefreshCw,
  Terminal,
  Activity,
  HeartPulse,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Wifi,
  Sliders,
  Laptop
} from 'lucide-react';
import { NetbootDevice, ActiveSession, PXEImageDetail } from '../../types';

interface GarosMobileManagerViewProps {
  devices: NetbootDevice[];
  sessions: ActiveSession[];
  pxeImages: PXEImageDetail[];
  onWakeOnLan: (mac: string) => void;
  onRebootDevice: (mac: string) => void;
  onOpenConsole: (dev: NetbootDevice) => void;
  onOpenHealthModal: (dev: NetbootDevice) => void;
  onBroadcastMessage: (msg: string) => void;
  onSwitchToDesktopMode: () => void;
}

export const GarosMobileManagerView: React.FC<GarosMobileManagerViewProps> = ({
  devices,
  sessions,
  pxeImages,
  onWakeOnLan,
  onRebootDevice,
  onOpenConsole,
  onOpenHealthModal,
  onBroadcastMessage,
  onSwitchToDesktopMode,
}) => {
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'warning'>('all');
  const [broadcastInput, setBroadcastInput] = useState('');
  const [showBroadcastBox, setShowBroadcastBox] = useState(false);

  const onlineDevices = devices.filter((d) => d.status === 'Online');
  const offlineDevices = devices.filter((d) => d.status === 'Offline');
  const warningDevices = devices.filter((d) => (d.cpuTempC || 0) > 65 || d.status === 'Warning');

  const filteredDevices = devices.filter((d) => {
    if (filter === 'online') return d.status === 'Online';
    if (filter === 'offline') return d.status === 'Offline';
    if (filter === 'warning') return (d.cpuTempC || 0) > 65 || d.status === 'Warning';
    return true;
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;
    onBroadcastMessage(broadcastInput);
    setBroadcastInput('');
    setShowBroadcastBox(false);
  };

  const handleWakeAllOffline = () => {
    offlineDevices.forEach((d) => onWakeOnLan(d.mac));
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Device Auto-Recognition Header Bar */}
      <div className="p-3.5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/40 rounded-2xl shadow-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300">
            <Smartphone size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
              <span>App Gestor Mobile TI</span>
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[9px] font-mono border border-purple-400/30">
                DISPOSITIVO DETECTADO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Visão otimizada para controle rápido da empresa via celular
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchToDesktopMode}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 shrink-0 active:scale-95 transition-all"
          title="Ver versão completa de PC"
        >
          <Laptop size={12} className="text-kve-accent" />
          <span>Visão PC</span>
        </button>
      </div>

      {/* Executive Quick Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: Estações Online */}
        <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-md space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono tracking-wider">
            <span>Máquinas</span>
            <Monitor size={14} className="text-kve-accent" />
          </div>
          <div className="text-xl font-black text-white flex items-baseline gap-1.5">
            <span>{onlineDevices.length}</span>
            <span className="text-xs text-slate-500 font-normal">/ {devices.length} Ligadas</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-kve-success h-full rounded-full transition-all duration-500"
              style={{ width: `${(onlineDevices.length / (devices.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 2: Usuários em Uso */}
        <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-md space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono tracking-wider">
            <span>Sessões Ativas</span>
            <Users size={14} className="text-sky-400" />
          </div>
          <div className="text-xl font-black text-white flex items-baseline gap-1">
            <span>{sessions.length}</span>
            <span className="text-xs text-slate-500 font-normal">usuários</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 truncate">
            {sessions[0]?.username ? `@${sessions[0].username} e mais...` : 'Nenhum usuário'}
          </div>
        </div>

        {/* Card 3: Servidor Central */}
        <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-md space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono tracking-wider">
            <span>Boot TFTP/NFS</span>
            <Activity size={14} className="text-kve-success" />
          </div>
          <div className="text-sm font-black text-kve-success flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-kve-success animate-ping" />
            100% OPERACIONAL
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate">
            Sem disco • Centralizado
          </div>
        </div>

        {/* Card 4: Alertas de Saúde */}
        <div className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-md space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono tracking-wider">
            <span>Temperatura</span>
            <Thermometer size={14} className={warningDevices.length > 0 ? "text-amber-400" : "text-emerald-400"} />
          </div>
          <div className={`text-sm font-black ${warningDevices.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {warningDevices.length > 0 ? `${warningDevices.length} AVISOS >65°C` : 'NORMAL (38°C Média)'}
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate">
            Hardware monitorado
          </div>
        </div>
      </div>

      {/* One-Tap Manager Action Grid */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 backdrop-blur-lg">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
          <span>Ações Rápidas de Impacto</span>
          <span className="text-[10px] font-mono text-purple-400">1-Touch Executivo</span>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {/* Action 1: Ligar Toda a Empresa */}
          <button
            onClick={handleWakeAllOffline}
            disabled={offlineDevices.length === 0}
            className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex flex-col items-start justify-between gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/30 text-amber-300">
              <Power size={18} />
            </div>
            <div className="text-left">
              <div className="leading-tight">Ligar Toda a Empresa</div>
              <div className="text-[9px] text-amber-400/80 font-mono font-normal">
                WOL em {offlineDevices.length} offline
              </div>
            </div>
          </button>

          {/* Action 2: Enviar Aviso Broadcast */}
          <button
            onClick={() => setShowBroadcastBox(!showBroadcastBox)}
            className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/40 text-sky-300 font-extrabold text-xs flex flex-col items-start justify-between gap-2 active:scale-95 transition-all"
          >
            <div className="p-1.5 rounded-lg bg-sky-500/30 text-sky-300">
              <Send size={18} />
            </div>
            <div className="text-left">
              <div className="leading-tight">Mensagem Broadcast</div>
              <div className="text-[9px] text-sky-400/80 font-mono font-normal">
                Aviso em tela cheia
              </div>
            </div>
          </button>
        </div>

        {/* Broadcast Box Input */}
        {showBroadcastBox && (
          <form onSubmit={handleSendBroadcast} className="pt-2 flex items-center gap-2 animate-in fade-in duration-200">
            <input
              type="text"
              value={broadcastInput}
              onChange={(e) => setBroadcastInput(e.target.value)}
              placeholder="Ex: Reunião geral às 15h no auditório..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
            >
              Enviar
            </button>
          </form>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
            filter === 'all'
              ? 'bg-kve-accent text-slate-950 shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}
        >
          Todas ({devices.length})
        </button>
        <button
          onClick={() => setFilter('online')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
            filter === 'online'
              ? 'bg-kve-success text-slate-950 shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}
        >
          Ligadas ({onlineDevices.length})
        </button>
        <button
          onClick={() => setFilter('offline')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
            filter === 'offline'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}
        >
          Desligadas ({offlineDevices.length})
        </button>
      </div>

      {/* Mobile Station Cards List */}
      <div className="space-y-3">
        {filteredDevices.length === 0 ? (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
            Nenhuma máquina encontrada neste filtro.
          </div>
        ) : (
          filteredDevices.map((dev) => {
            const isOnline = dev.status === 'Online';
            const isWarning = (dev.cpuTempC || 0) > 65;

            return (
              <div
                key={dev.mac}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isOnline
                    ? 'bg-slate-900/90 border-slate-800 shadow-lg'
                    : 'bg-slate-950/80 border-slate-900 opacity-80'
                }`}
              >
                {/* Card Top: Name & Main Action */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        isOnline ? 'bg-kve-success/20 text-kve-success' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Monitor size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>{dev.hostname}</span>
                        {isWarning && (
                          <AlertTriangle size={14} className="text-amber-400 animate-bounce" />
                        )}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        IP: <strong className="text-slate-200">{dev.ip}</strong> • {dev.mac}
                      </p>
                    </div>
                  </div>

                  {/* Big Power Button */}
                  {isOnline ? (
                    <button
                      onClick={() => onRebootDevice(dev.mac)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs active:scale-95 transition-all flex items-center gap-1"
                      title="Reiniciar Estação"
                    >
                      <RefreshCw size={13} className="text-amber-400" /> Reboot
                    </button>
                  ) : (
                    <button
                      onClick={() => onWakeOnLan(dev.mac)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-amber-500/20"
                    >
                      <Power size={13} /> Ligar WOL
                    </button>
                  )}
                </div>

                {/* Info Badges Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[9px] uppercase text-slate-500 block">Usuário Logado</span>
                    <span className="font-bold text-slate-200 truncate block mt-0.5">
                      {dev.currentUser || 'Livre'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[9px] uppercase text-slate-500 block">Temperatura / Ping</span>
                    <span className={`font-bold block mt-0.5 ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {dev.cpuTempC || 40}°C • {dev.pingMs || 1}ms
                    </span>
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => onOpenHealthModal(dev)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <HeartPulse size={14} className="text-kve-success" />
                    <span>Telemetria</span>
                  </button>

                  <button
                    onClick={() => onOpenConsole(dev)}
                    className="py-2 px-3 rounded-xl bg-kve-accent/20 border border-kve-accent/40 text-kve-accent font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Terminal size={14} />
                    <span>Console</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GarosMobileManagerView;
