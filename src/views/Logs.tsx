import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Search, Filter, Download, Trash2, Clock, AlertTriangle, CheckCircle2, Info, Terminal, Activity, Zap } from 'lucide-react';
import KveCard from '../components/KveCard';
import ToastContainer from '../components/ToastContainer';
import { AuditLog, ToastNotification } from '../types';
import { fetchGarosLogs } from '../services/api';
import { clsx } from 'clsx';

const LogsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'danger' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const loadLogs = async () => {
    try {
      const data = await fetchGarosLogs();
      setLogs(data);
    } catch (e) {
      console.error("Error fetching logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garos-audit-logs-${Date.now()}.json`;
    a.click();
    addToast('Relatório Exportado', 'Os logs de auditoria foram baixados no formato JSON.', 'success');
  };

  const handleClearBuffer = () => {
    setLogs([]);
    addToast('Buffer Limpo', 'O buffer de logs em memória foi reiniciado.', 'warning');
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-24 relative"
    >
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Logs & Auditoria de Redes Boot PXE</h2>
          <p className="text-slate-500 text-sm">Trilha de eventos do servidor de TFTP/NFS e atividades dos clientes diskless</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportLogs}
            className="px-4 py-2 rounded-lg bg-slate-900/50 border border-kve-border text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Download size={18} /> EXPORTAR LOGS
          </button>
          <button 
            onClick={handleClearBuffer}
            className="px-4 py-2 rounded-lg bg-kve-danger/10 border border-kve-danger/20 text-kve-danger font-bold text-sm hover:bg-kve-danger hover:text-white transition-all flex items-center gap-2"
          >
            <Trash2 size={18} /> LIMPAR BUFFER
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Filtrar por mensagem, usuário ou fonte..." 
            className="w-full bg-slate-900/50 border border-kve-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-kve-accent/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 rounded-lg bg-slate-900/50 border border-kve-border text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Filter size={16} /> Nível: Todos
          </button>
          <button className="px-4 py-2.5 rounded-lg bg-slate-900/50 border border-kve-border text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Clock size={16} /> Últimas 24h
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KveCard className="glass-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-kve-accent/10 rounded-lg text-kve-accent">
              <Activity size={16} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Eventos</p>
          </div>
          <p className="text-2xl font-bold text-white">{logs.length * 128 + 140}</p>
        </KveCard>
        <KveCard className="glass-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-kve-danger/10 rounded-lg text-kve-danger">
              <AlertTriangle size={16} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Erros Críticos</p>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
        </KveCard>
        <KveCard className="glass-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-kve-warning/10 rounded-lg text-kve-warning">
              <Zap size={16} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alertas WOL</p>
          </div>
          <p className="text-2xl font-bold text-white">12</p>
        </KveCard>
        <KveCard className="glass-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-kve-success/10 rounded-lg text-kve-success">
              <Terminal size={16} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Trail</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">ATIVO</p>
        </KveCard>
      </div>

      <KveCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-kve-border bg-slate-900/20">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-48">Data / Hora</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Nível</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Fonte</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mensagem</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kve-border font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 text-[10px] text-slate-500">
                      {log.time}
                    </td>
                    <td className="px-6 py-4">
                      <div className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-center",
                        log.level === 'success' ? "bg-kve-success/10 text-kve-success" :
                        log.level === 'warning' ? "bg-kve-warning/10 text-kve-warning" :
                        log.level === 'danger' ? "bg-kve-danger/10 text-kve-danger" :
                        "bg-kve-accent/10 text-kve-accent"
                      )}>
                        {log.level}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <Info size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </KveCard>
    </motion.div>
  );
};

export default LogsView;
