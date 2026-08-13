import React, { useState } from 'react';
import { Monitor, Power, Terminal, Search, Filter, Cpu, RefreshCw, HeartPulse, User, Thermometer, ShieldCheck, Wifi, Activity, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { NetbootDevice, PXEImageDetail } from '../../types';

export type { NetbootDevice };
export type PXEImage = PXEImageDetail;

interface GarosTerminalTableProps {
  devices: NetbootDevice[];
  pxeImages: PXEImage[];
  onImageChange: (mac: string, imageId: string) => void;
  onWakeOnLan: (mac: string) => void;
  onOpenConsole: (device: NetbootDevice) => void;
  onOpenHealthModal: (device: NetbootDevice) => void;
}

export const GarosTerminalTable: React.FC<GarosTerminalTableProps> = ({
  devices,
  pxeImages,
  onImageChange,
  onWakeOnLan,
  onOpenConsole,
  onOpenHealthModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Online' | 'Booting' | 'Offline'>('ALL');

  const filteredDevices = devices.filter((dev) => {
    const matchesSearch =
      dev.hostname.toLowerCase().includes(search.toLowerCase()) ||
      dev.ip.toLowerCase().includes(search.toLowerCase()) ||
      dev.mac.toLowerCase().includes(search.toLowerCase()) ||
      (dev.currentUser && dev.currentUser.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || dev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header & Physical Station Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Monitor size={18} className="text-kve-accent" />
            Estações de Trabalho Físicas Diskless (GAROS Netboot)
          </h3>
          <p className="text-xs text-slate-400">
            Computadores físicos clientes inicializados via rede PXE/NFS sem consumo de máquinas virtuais ou containers
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80 shrink-0">
          {(['ALL', 'Online', 'Booting', 'Offline'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                statusFilter === st
                  ? 'bg-kve-accent text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st === 'Online' ? 'Conectados' : st === 'Booting' ? 'Ligando' : 'Desligados'}
            </button>
          ))}
        </div>
      </div>

      {/* Clarification Banner & Quick Batch Actions */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-kve-success" />
          <span>Arquitetura Bare-Metal Direct: <strong className="text-white font-semibold">Sem Hypervisor / Sem VMs</strong></span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Batch WOL Button */}
          <button
            onClick={() => {
              devices.filter(d => d.status === 'Offline').forEach(d => onWakeOnLan(d.mac));
            }}
            className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
            title="Ligar todas as estações desligadas com sinal Wake-on-LAN"
          >
            <Power size={11} /> Ligar Todos (WOL)
          </button>

          {/* Mass PXE Profile */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg text-[10px]">
            <span className="text-slate-500">Massa:</span>
            <select
              onChange={(e) => {
                if (!e.target.value) return;
                const val = e.target.value;
                devices.forEach(d => onImageChange(d.mac, val));
              }}
              defaultValue=""
              className="bg-transparent text-purple-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="" disabled>Aplicar Imagem PXE...</option>
              {pxeImages.map((img) => (
                <option key={img.id} value={img.id} className="bg-slate-900 text-white">
                  {img.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[10px] text-slate-500 hidden xl:inline">
            {devices.filter(d => d.status === 'Online').length} Ativas / {devices.length} Total
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome da estação, IP, MAC ou usuário logado..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-kve-accent/50 transition-colors"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-500 bg-slate-900/60 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Estação / MAC</th>
              <th className="py-3 px-4">Usuário Logado</th>
              <th className="py-3 px-4">Saúde do Hardware</th>
              <th className="py-3 px-4">IP / Link</th>
              <th className="py-3 px-4">Perfil PXE</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                  Nenhuma estação física encontrada para os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredDevices.map((dev) => {
                const isOnline = dev.status === 'Online';
                const hasUser = dev.currentUser && dev.currentUser !== 'Nenhum (Livre)';
                const isTempHigh = (dev.cpuTempC || 0) > 65;

                return (
                  <tr key={dev.mac} className="hover:bg-slate-800/30 transition-colors group">
                    {/* Hostname & MAC */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Monitor size={14} className="text-slate-400 group-hover:text-kve-accent transition-colors shrink-0" />
                        <span>{dev.hostname}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>{dev.mac}</span>
                      </div>
                    </td>

                    {/* Logged-In User */}
                    <td className="py-3 px-4">
                      {hasUser ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-kve-accent/20 border border-kve-accent/40 flex items-center justify-center font-bold text-[10px] text-kve-accent">
                            {dev.currentUser!.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white leading-tight">{dev.currentUser}</div>
                            <div className="text-[9px] text-slate-400">{dev.currentUserRole || 'Operador'}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[10px] flex items-center gap-1">
                          <User size={12} className="text-slate-600" /> Livre / Ninguém
                        </span>
                      )}
                    </td>

                    {/* Hardware Health Pill (Interactive) */}
                    <td className="py-3 px-4">
                      {isOnline ? (
                        <button
                          onClick={() => onOpenHealthModal(dev)}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 ${
                            isTempHigh
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                              : 'bg-kve-success/10 border-kve-success/30 text-kve-success hover:bg-kve-success/20'
                          }`}
                          title="Clique para abrir detalhes completos da telemetria e sensores"
                        >
                          <HeartPulse size={12} />
                          <span>{dev.cpuTempC || 40}°C</span>
                          <span className="text-[9px] opacity-80">({dev.pingMs || 0.5}ms)</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Sem Telemetria</span>
                      )}
                    </td>

                    {/* IP & Link Speed */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{dev.ip}</div>
                      <div className="text-[9px] text-slate-500">{dev.networkLink || '1 Gbps'}</div>
                    </td>

                    {/* PXE Profile Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={dev.assignedImageId}
                        onChange={(e) => onImageChange(dev.mac, e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-semibold text-kve-accent focus:outline-none focus:border-kve-accent/50 cursor-pointer max-w-[140px] truncate"
                      >
                        {pxeImages.map((img) => (
                          <option key={img.id} value={img.id}>
                            {img.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          dev.status === 'Online'
                            ? 'bg-kve-success/15 text-kve-success border border-kve-success/30'
                            : dev.status === 'Booting'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-slate-800/60 text-slate-500 border border-slate-700/50'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            dev.status === 'Online'
                              ? 'bg-kve-success'
                              : dev.status === 'Booting'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                        />
                        {dev.status === 'Online' ? 'Conectado' : dev.status === 'Booting' ? 'Ligando...' : 'Offline'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isOnline && (
                          <button
                            onClick={() => onOpenHealthModal(dev)}
                            className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] transition-colors"
                            title="Ver Telemetria & Saúde do Hardware"
                          >
                            <HeartPulse size={12} className="text-kve-success" />
                          </button>
                        )}

                        {dev.status === 'Offline' ? (
                          <button
                            onClick={() => onWakeOnLan(dev.mac)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-extrabold text-[10px] transition-all flex items-center gap-1"
                            title="Ligar terminal via Magic Packet Wake-on-LAN"
                          >
                            <Power size={11} /> WOL
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenConsole(dev)}
                            className="px-2.5 py-1 rounded-lg bg-kve-accent/15 border border-kve-accent/30 text-kve-accent hover:bg-kve-accent hover:text-slate-950 font-extrabold text-[10px] transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(56,189,248,0.15)]"
                            title="Abrir Console Remoto (VNC / SSH)"
                          >
                            <Terminal size={11} /> Console VNC
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Touch-Optimized Mobile Cards View (for Smartphones / Tablets) */}
      <div className="block md:hidden space-y-3">
        {filteredDevices.length === 0 ? (
          <div className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center text-slate-500 text-xs">
            Nenhuma estação física encontrada.
          </div>
        ) : (
          filteredDevices.map((dev) => {
            const isOnline = dev.status === 'Online';
            const hasUser = dev.currentUser && dev.currentUser !== 'Nenhum (Livre)';
            const isTempHigh = (dev.cpuTempC || 0) > 65;

            return (
              <div
                key={dev.mac}
                className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-3 backdrop-blur-md"
              >
                {/* Header: Hostname, IP & Status */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <Monitor size={16} className="text-kve-accent" />
                      <span>{dev.hostname}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      IP: {dev.ip} • <span className="text-slate-500">{dev.mac}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      dev.status === 'Online'
                        ? 'bg-kve-success/15 text-kve-success border border-kve-success/30'
                        : dev.status === 'Booting'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                        : 'bg-slate-800/80 text-slate-500 border border-slate-700/50'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        dev.status === 'Online'
                          ? 'bg-kve-success'
                          : dev.status === 'Booting'
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                    />
                    {dev.status === 'Online' ? 'Conectado' : dev.status === 'Booting' ? 'Ligando...' : 'Offline'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Usuário</span>
                    <span className="font-bold text-slate-200 truncate block mt-0.5">
                      {hasUser ? dev.currentUser : 'Livre / Ninguém'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Perfil Boot</span>
                    <select
                      value={dev.assignedImageId}
                      onChange={(e) => onImageChange(dev.mac, e.target.value)}
                      className="bg-transparent text-kve-accent font-bold text-[11px] focus:outline-none w-full truncate mt-0.5"
                    >
                      {pxeImages.map((img) => (
                        <option key={img.id} value={img.id} className="bg-slate-900 text-white">
                          {img.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mobile Actions Toolbar */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  {isOnline ? (
                    <button
                      onClick={() => onOpenHealthModal(dev)}
                      className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isTempHigh
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 active:scale-95'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-200 active:scale-95'
                      }`}
                    >
                      <HeartPulse size={15} className="text-kve-success" />
                      <span>{dev.cpuTempC || 40}°C (Telemetria)</span>
                    </button>
                  ) : (
                    <span className="text-slate-500 text-xs font-mono italic">Sem Telemetria</span>
                  )}

                  {dev.status === 'Offline' ? (
                    <button
                      onClick={() => onWakeOnLan(dev.mac)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 border border-amber-400 text-slate-950 font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Power size={15} /> Ligar (WOL)
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenConsole(dev)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-kve-accent border border-sky-400 text-slate-950 font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Terminal size={15} /> Console VNC
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GarosTerminalTable;
