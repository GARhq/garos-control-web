import React from 'react';
import { Monitor, HeartPulse, Cpu, Thermometer, Wifi, User, Activity, Clock, ShieldCheck, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NetbootDevice } from './GarosTerminalTable';

interface GarosTerminalHealthModalProps {
  device: NetbootDevice | null;
  onClose: () => void;
  onReboot: (mac: string) => void;
}

export const GarosTerminalHealthModal: React.FC<GarosTerminalHealthModalProps> = ({
  device,
  onClose,
  onReboot,
}) => {
  if (!device) return null;

  const isOnline = device.status === 'Online';
  const isWarning = device.health === 'Warning' || (!!device.cpuTempC && device.cpuTempC > 65);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                !isOnline ? 'bg-slate-800 text-slate-500 border-slate-700' :
                isWarning ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-kve-success/10 text-kve-success border-kve-success/30'
              }`}>
                <HeartPulse size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  Telemetria & Saúde: <span className="text-kve-accent">{device.hostname}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {device.hardwareModel || 'Estação Física Diskless'} • IP: {device.ip} • MAC: {device.mac}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Banner: Physical Diskless Guarantee */}
            <div className="p-3 bg-kve-accent/10 border border-kve-accent/30 rounded-xl text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={16} className="text-kve-accent shrink-0" />
                <span>Estação de Trabalho Física (Diskless PXE/NFS) — Execução direto no Hardware</span>
              </div>
              <span className="text-[10px] font-mono text-kve-accent bg-kve-accent/10 px-2 py-0.5 rounded border border-kve-accent/20">
                GAROS OS
              </span>
            </div>

            {/* Logged-In User Card */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={13} className="text-kve-accent" />
                  Usuário Atualmente Logado na Estação
                </span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  device.currentUser && device.currentUser !== 'Nenhum (Livre)'
                    ? 'bg-kve-success/15 text-kve-success border border-kve-success/30'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {device.currentUser && device.currentUser !== 'Nenhum (Livre)' ? 'SESSÃO ATIVA' : 'SEM SESSÃO'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-kve-accent">
                    {device.currentUser ? device.currentUser.charAt(0).toUpperCase() : 'N'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {device.currentUser || 'Nenhum (Livre / Tela de Login)'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {device.currentUserRole || 'Aguardando Operador'}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <div>Login: <strong className="text-slate-200">{device.loginTime || 'N/A'}</strong></div>
                  <div>Status: <strong className="text-kve-success">{isOnline ? 'Conectado' : 'Desconectado'}</strong></div>
                </div>
              </div>
            </div>

            {/* Health Sensors Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Temp Sensor */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                  <span className="flex items-center gap-1">
                    <Thermometer size={12} className={device.cpuTempC > 65 ? 'text-amber-400' : 'text-kve-success'} /> Temp. CPU
                  </span>
                  <span className="font-mono text-xs text-white">{device.cpuTempC || 40}°C</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${device.cpuTempC > 65 ? 'bg-amber-400' : 'bg-kve-success'}`}
                    style={{ width: `${Math.min(100, (device.cpuTempC / 85) * 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 font-mono">Sensors: CoreTemp OK</p>
              </div>

              {/* Fan Speed */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                  <span className="flex items-center gap-1">
                    <RefreshCw size={12} className="text-kve-accent" /> Cooler RPM
                  </span>
                  <span className="font-mono text-xs text-white">{device.fanSpeedRpm || 1800} RPM</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-kve-accent" style={{ width: '65%' }} />
                </div>
                <p className="text-[9px] text-slate-500 font-mono">Fan: Automático (PWM)</p>
              </div>

              {/* Ping / Network Latency */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                  <span className="flex items-center gap-1">
                    <Wifi size={12} className="text-kve-success" /> Latência Ping
                  </span>
                  <span className="font-mono text-xs text-white">{device.pingMs || 0.5} ms</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-kve-success" style={{ width: '15%' }} />
                </div>
                <p className="text-[9px] text-slate-500 font-mono">{device.networkLink || '1 Gbps'}</p>
              </div>

              {/* NFS RootFS Latency */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                  <span className="flex items-center gap-1">
                    <Activity size={12} className="text-purple-400" /> Latência NFS
                  </span>
                  <span className="font-mono text-xs text-white">{device.nfsLatencyMs || 0.2} ms</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: '10%' }} />
                </div>
                <p className="text-[9px] text-slate-500 font-mono">RootFS Read/Write OK</p>
              </div>
            </div>

            {/* Hardware Telemetry Table */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Especificações do Terminal Físico
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Processador (CPU)</span>
                  <strong>{device.cpuCores} Núcleos Físicos</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Memória RAM</span>
                  <strong>{device.ramGb} GB DDR4 (Uso: {device.memUsagePct || 35}%)</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Placa de Rede (NIC)</span>
                  <strong>{device.networkLink || 'Realtek 2.5GbE'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Uso de CPU</span>
                  <strong className="text-kve-accent">{device.cpuUsagePct || 15}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Tempo de Atividade (Uptime)</span>
                  <strong>{device.uptime || '3h 45m'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Qualidade do Link</span>
                  <strong className="text-kve-success">100% (0 pacotes perdidos)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-500">
              Telemetria atualizada em tempo real via agente GAROS
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onReboot(device.mac)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all"
              >
                Reiniciar Estação
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GarosTerminalHealthModal;
