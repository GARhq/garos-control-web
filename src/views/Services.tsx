import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Server, Play, Square, RotateCcw, Terminal, Activity, Cpu, Database, Search, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import KveCard from '../components/KveCard';
import Modal from '../components/Modal';
import { useGarosStore } from '../store/useGarosStore';

const ServicesView: React.FC = () => {
  const services = useGarosStore((s) => s.services);
  const toggleServiceStatus = useGarosStore((s) => s.toggleServiceStatus);
  const restartService = useGarosStore((s) => s.restartService);
  const systemLogs = useGarosStore((s) => s.systemLogs);
  const userRole = useGarosStore((s) => s.userRole);

  const [search, setSearch] = useState('');
  const [inspectService, setInspectService] = useState<string | null>(null);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const runningCount = services.filter((s) => s.status === 'active').length;
  const stoppedCount = services.filter((s) => s.status === 'inactive').length;
  const failedCount = services.filter((s) => s.status === 'failed').length;

  const activeInspectService = services.find((s) => s.name === inspectService);
  const serviceLogs = inspectService
    ? systemLogs.filter((l) => l.service.toLowerCase().includes(inspectService.toLowerCase()) || l.message.toLowerCase().includes(inspectService.toLowerCase()))
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase flex items-center gap-2.5">
            <Server size={22} className="text-sky-400" />
            <span>Serviços do Sistema & Daemons Systemd</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de processos da infraestrutura diskless (nfs-kernel-server, dnsmasq, tftp-server, nftables-firewall, sshd).
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input 
            type="text" 
            placeholder="Buscar por nome do daemon..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Summary Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <KveCard className="glass-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Em Execução</p>
              <p className="text-2xl font-black text-white">{runningCount}</p>
            </div>
          </div>
        </KveCard>

        <KveCard className="glass-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inativos / Parados</p>
              <p className="text-2xl font-black text-white">{stoppedCount}</p>
            </div>
          </div>
        </KveCard>

        <KveCard className="glass-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Falhas</p>
              <p className="text-2xl font-black text-white">{failedCount}</p>
            </div>
          </div>
        </KveCard>

        <KveCard className="glass-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Load Average</p>
              <p className="text-2xl font-black text-white">0.24, 0.18</p>
            </div>
          </div>
        </KveCard>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => (
          <div key={service.name} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4 shadow-xl font-mono">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Server size={18} className="text-sky-400" />
                  <h3 className="text-base font-bold text-white uppercase">{service.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    service.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                    service.status === 'failed' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {service.status}
                  </span>
                  <span className="text-slate-500">Uptime: {service.uptime}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setInspectService(service.name)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-bold transition-all"
                  title="Inspecionar Logs do Daemon"
                >
                  <Terminal size={15} />
                </button>

                <button
                  onClick={() => restartService(service.name)}
                  disabled={userRole === 'user'}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                  title="Reiniciar Daemon"
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  onClick={() => toggleServiceStatus(service.name)}
                  disabled={userRole === 'user'}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    service.status === 'active'
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                  }`}
                  title={service.status === 'active' ? 'Parar Serviço' : 'Iniciar Serviço'}
                >
                  {service.status === 'active' ? <Square size={15} /> : <Play size={15} />}
                </button>
              </div>
            </div>

            {/* Metrics Sliders */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Cpu size={12} /> CPU</span>
                  <span className="font-bold text-white">{service.cpu}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: `${Math.min(100, service.cpu * 4)}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Database size={12} /> RAM</span>
                  <span className="font-bold text-white">{service.memoryMb} MB</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${Math.min(100, (service.memoryMb / 1024) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Inspect Logs Modal */}
      {activeInspectService && (
        <Modal
          isOpen={!!activeInspectService}
          onClose={() => setInspectService(null)}
          title={`Logs em Tempo Real: journalctl -u ${activeInspectService.name}`}
          type="info"
          footer={
            <div className="flex justify-end">
              <button onClick={() => setInspectService(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-mono font-bold">FECHAR INSPEÇÃO</button>
            </div>
          }
        >
          <div className="space-y-3 font-mono">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 max-h-80 overflow-y-auto text-xs text-slate-300">
              {serviceLogs.length === 0 ? (
                <p className="text-slate-500 italic">Nenhum evento recente para {activeInspectService.name}.</p>
              ) : (
                serviceLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 border-b border-slate-900 pb-1.5">
                    <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
                      log.severity === 'ERROR' ? 'bg-rose-500/20 text-rose-400' :
                      log.severity === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'
                    }`}>
                      {log.severity}
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default ServicesView;
