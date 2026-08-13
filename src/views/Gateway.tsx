import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Network, Shield, ShieldAlert, ShieldCheck, Globe, Lock, Unlock, Search, Plus, Trash2, Activity, Zap, ArrowRight, Pause, Play, AlertTriangle } from 'lucide-react';
import KveCard from '../components/KveCard';
import Modal from '../components/Modal';
import { useGarosStore } from '../store/useGarosStore';

const GatewayView: React.FC = () => {
  const firewallRules = useGarosStore((s) => s.firewallRules);
  const addFirewallRule = useGarosStore((s) => s.addFirewallRule);
  const removeFirewallRule = useGarosStore((s) => s.removeFirewallRule);
  const activeConnections = useGarosStore((s) => s.activeConnections);
  const isConnectionsFrozen = useGarosStore((s) => s.isConnectionsFrozen);
  const toggleFreezeConnections = useGarosStore((s) => s.toggleFreezeConnections);
  const panicModeActive = useGarosStore((s) => s.panicModeActive);
  const userRole = useGarosStore((s) => s.userRole);
  const addToast = useGarosStore((s) => s.addToast);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // New Rule Form
  const [ruleChain, setRuleChain] = useState<'input' | 'output' | 'forward'>('input');
  const [ruleProto, setRuleProto] = useState<'tcp' | 'udp' | 'icmp'>('tcp');
  const [rulePort, setRulePort] = useState('');
  const [ruleSourceIp, setRuleSourceIp] = useState('192.168.1.0/24');
  const [ruleAction, setRuleAction] = useState<'accept' | 'drop' | 'reject'>('accept');
  const [ruleComment, setRuleComment] = useState('');

  const handleCreateRule = () => {
    if (!rulePort.trim() || !ruleComment.trim()) {
      addToast('Dados Incompletos', 'Informe a porta e a descrição da regra.', 'warning');
      return;
    }

    const res = addFirewallRule({
      chain: ruleChain,
      proto: ruleProto,
      port: rulePort.trim(),
      sourceIp: ruleSourceIp.trim() || '0.0.0.0/0',
      action: ruleAction,
      comment: ruleComment.trim(),
    });

    if (!res.success) {
      setConflictError(res.error || 'Conflito de regra detectado.');
    } else {
      setIsModalOpen(false);
      setRulePort('');
      setRuleComment('');
      setConflictError(null);
    }
  };

  const filteredRules = firewallRules.filter(
    (r) =>
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.port.toLowerCase().includes(search.toLowerCase()) ||
      r.sourceIp.toLowerCase().includes(search.toLowerCase())
  );

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
            <Network size={22} className="text-sky-400" />
            <span>Rede, Subredes & Firewall NFTables</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mapeamento de conexões, filtragem de portas e prevenção de conflitos de regras em tempo real.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={userRole === 'user'}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-extrabold transition-all flex items-center gap-2 shadow-lg ${
            userRole === 'user'
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-900/40'
          }`}
        >
          <Plus size={16} /> NOVA REGRA NFTABLES
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KveCard className="glass-hover">
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-xl ${panicModeActive ? 'bg-rose-600 text-white animate-bounce' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {panicModeActive ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status NFTables</p>
              <p className={`text-xl font-black ${panicModeActive ? 'text-rose-400' : 'text-white'}`}>
                {panicModeActive ? 'DROP ALL (PÂNICO)' : 'PROTEGIDO (100%)'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {panicModeActive ? 'Atenção: Modo emergência ativado, todo o tráfego não essencial foi bloqueado.' : `${firewallRules.length} regras ativas no subsistema NFTables.`}
          </p>
        </KveCard>

        <KveCard className="glass-hover">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Banda WAN / Local</p>
              <p className="text-xl font-black text-white">{panicModeActive ? '0.0 Mbps' : '48.2 Mbps'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="text-emerald-400 font-bold">↑ {panicModeActive ? '0' : '8.4'} Mbps TX</span>
            <span className="text-sky-400 font-bold">↓ {panicModeActive ? '0' : '39.8'} Mbps RX</span>
          </div>
        </KveCard>

        <KveCard className="glass-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sessões Ativas</p>
                <p className="text-xl font-black text-white">{activeConnections.length} conexões</p>
              </div>
            </div>

            <button
              onClick={toggleFreezeConnections}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border transition-all ${
                isConnectionsFrozen
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {isConnectionsFrozen ? <Play size={12} /> : <Pause size={12} />}
              <span>{isConnectionsFrozen ? 'Descongelar' : 'Congelar'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {isConnectionsFrozen ? 'Fluxo de pacotes congelado para inspeção técnica.' : 'Monitorando sokets TCP/UDP em tempo real.'}
          </p>
        </KveCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Firewall Rules Table */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-sky-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">Tabela de Regras (NFTables)</h3>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Filtrar por porta ou IP..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Cadeia (Chain)</th>
                  <th className="p-4">Porta / Proto</th>
                  <th className="p-4">Origem</th>
                  <th className="p-4">Ação</th>
                  <th className="p-4">Comentário</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-mono text-xs uppercase">
                      Nenhuma regra encontrada
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-slate-300 uppercase">{rule.chain}</td>
                      <td className="p-4 font-bold text-sky-400">{rule.port} / {rule.proto.toUpperCase()}</td>
                      <td className="p-4 text-slate-400">{rule.sourceIp}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rule.action === 'accept' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {rule.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{rule.comment}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => removeFirewallRule(rule.id)}
                          disabled={userRole === 'user'}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                          title="Remover Regra"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Connections Panel */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">Conexões no Gateway</h3>
            </div>
            {isConnectionsFrozen && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-mono uppercase">CONGELADO</span>
            )}
          </div>

          <div className="space-y-3">
            {activeConnections.map((conn) => (
              <div key={conn.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400">{conn.srcIp}:{conn.srcPort}</span>
                  <span className="text-[10px] text-slate-500">{conn.protocol}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <div className="flex items-center gap-1">
                    <ArrowRight size={12} className="text-slate-600" />
                    <span>{conn.dstIp}:{conn.dstPort}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{conn.bytesSent}</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 flex justify-between">
                  <span>Processo: {conn.process}</span>
                  <span className="text-emerald-500 font-bold">{conn.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Rule Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setConflictError(null);
        }}
        title="Adicionar Regra NFTables"
        type="info"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white">CANCELAR</button>
            <button onClick={handleCreateRule} className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-mono font-extrabold text-xs">APLICAR REGRA</button>
          </div>
        }
      >
        <div className="space-y-4">
          {conflictError && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-400 shrink-0" />
              <span>{conflictError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Cadeia (Chain)</label>
              <select 
                value={ruleChain}
                onChange={(e) => setRuleChain(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none uppercase"
              >
                <option value="input">Input</option>
                <option value="output">Output</option>
                <option value="forward">Forward</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Protocolo</label>
              <select 
                value={ruleProto}
                onChange={(e) => setRuleProto(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none uppercase"
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="icmp">ICMP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Porta Destino</label>
              <input 
                type="text" 
                value={rulePort}
                onChange={(e) => setRulePort(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none" 
                placeholder="ex: 8080" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Origem CIDR</label>
              <input 
                type="text" 
                value={ruleSourceIp}
                onChange={(e) => setRuleSourceIp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none" 
                placeholder="ex: 192.168.1.0/24" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Ação</label>
              <select 
                value={ruleAction}
                onChange={(e) => setRuleAction(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none uppercase"
              >
                <option value="accept">Permitir (ACCEPT)</option>
                <option value="drop">Descartar (DROP)</option>
                <option value="reject">Rejeitar (REJECT)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Comentário / Finalidade</label>
              <input 
                type="text" 
                value={ruleComment}
                onChange={(e) => setRuleComment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none" 
                placeholder="ex: Acesso Web Interno" 
              />
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default GatewayView;
