import React, { useEffect } from 'react';
import { 
  Monitor, 
  Search, 
  Filter, 
  Zap, 
  Power, 
  Terminal, 
  ShieldCheck,
  CheckSquare,
  Square,
  Cpu,
  Activity,
  Wrench,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { useGarosStore } from '../store/useGarosStore';
import NodeDetailDrawer from '../components/nos/NodeDetailDrawer';

const NodesView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Zustand state
  const nodes = useGarosStore((s) => s.nodes);
  const selectedNodeMacs = useGarosStore((s) => s.selectedNodeMacs);
  const toggleSelectNode = useGarosStore((s) => s.toggleSelectNode);
  const selectAllNodes = useGarosStore((s) => s.selectAllNodes);
  const clearSelectedNodes = useGarosStore((s) => s.clearSelectedNodes);
  const drawerNodeMac = useGarosStore((s) => s.drawerNodeMac);
  const setDrawerNodeMac = useGarosStore((s) => s.setDrawerNodeMac);
  const nodeFilters = useGarosStore((s) => s.nodeFilters);
  const setNodeFilters = useGarosStore((s) => s.setNodeFilters);
  const performBulkNodeAction = useGarosStore((s) => s.performBulkNodeAction);
  const userRole = useGarosStore((s) => s.userRole);

  // Sync state with URL params on mount
  useEffect(() => {
    const statusParam = searchParams.get('status') || 'all';
    const osParam = searchParams.get('os') || 'all';
    const searchParam = searchParams.get('search') || '';
    setNodeFilters({ status: statusParam, os: osParam, search: searchParam });
  }, []);

  const handleFilterChange = (key: 'status' | 'os' | 'search', value: string) => {
    setNodeFilters({ [key]: value });
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      n.hostname.toLowerCase().includes(nodeFilters.search.toLowerCase()) ||
      n.ip.toLowerCase().includes(nodeFilters.search.toLowerCase()) ||
      n.mac.toLowerCase().includes(nodeFilters.search.toLowerCase());

    const matchesStatus =
      nodeFilters.status === 'all' ||
      (nodeFilters.status === 'online' && n.status === 'Online') ||
      (nodeFilters.status === 'offline' && n.status === 'Offline') ||
      (nodeFilters.status === 'booting' && n.status === 'Booting');

    return matchesSearch && matchesStatus;
  });

  const isAllSelected = filteredNodes.length > 0 && filteredNodes.every((n) => selectedNodeMacs.includes(n.mac));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase flex items-center gap-2.5">
            <Monitor size={22} className="text-sky-400" />
            <span>Gestão de Estações Diskless & Clientes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitoramento em tempo real, boot PXE/NFS e controle unificado do parque de terminais.
          </p>
        </div>

        {/* Selected Counter Badge */}
        {selectedNodeMacs.length > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold flex items-center gap-2">
            <span>{selectedNodeMacs.length} selecionado(s)</span>
            <button
              onClick={clearSelectedNodes}
              className="hover:text-white underline text-[10px] uppercase ml-1"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      {selectedNodeMacs.length > 0 && (
        <div className="p-3 bg-slate-900 border border-sky-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
            <ShieldCheck size={16} className="text-sky-400" />
            <span>AÇÕES EM LOTE PARA {selectedNodeMacs.length} MÁQUINAS:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => performBulkNodeAction('wol')}
              disabled={userRole === 'user'}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 text-xs font-bold font-mono transition-all flex items-center gap-1.5"
            >
              <Zap size={14} />
              <span>Wake-on-LAN</span>
            </button>
            <button
              onClick={() => performBulkNodeAction('maintenance')}
              disabled={userRole === 'user'}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold font-mono transition-all flex items-center gap-1.5"
            >
              <Wrench size={14} />
              <span>Modo Manutenção</span>
            </button>
            <button
              onClick={() => performBulkNodeAction('shutdown')}
              disabled={userRole === 'user'}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 text-xs font-bold font-mono transition-all flex items-center gap-1.5"
            >
              <Power size={14} />
              <span>Desligar</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Buscar por hostname, IP ou MAC..."
            value={nodeFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter size={14} />
            <span>Status:</span>
            <select
              value={nodeFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="booting">Booting PXE</option>
            </select>
          </div>

          <button
            onClick={() => (isAllSelected ? clearSelectedNodes() : selectAllNodes())}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            {isAllSelected ? <CheckSquare size={14} className="text-sky-400" /> : <Square size={14} />}
            <span>{isAllSelected ? 'Desmarcar Todos' : 'Marcar Todos'}</span>
          </button>
        </div>
      </div>

      {/* Nodes Table / Cards View */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10 text-center">#</th>
                <th className="p-4">Estação / Hostname</th>
                <th className="p-4">Endereço IP</th>
                <th className="p-4">MAC Address</th>
                <th className="p-4">Status & Heartbeat</th>
                <th className="p-4">Uso CPU / RAM</th>
                <th className="p-4">Usuário Ativo</th>
                <th className="p-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredNodes.map((node) => {
                const isSelected = selectedNodeMacs.includes(node.mac);
                return (
                  <tr
                    key={node.mac}
                    className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-sky-500/10' : ''
                    }`}
                    onClick={() => setDrawerNodeMac(node.mac)}
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelectNode(node.mac)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-sky-400" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Monitor size={16} className="text-sky-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">{node.hostname}</p>
                          <p className="text-[10px] text-slate-500">{node.hardwareModel}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300 font-bold">{node.ip}</td>

                    <td className="p-4 text-slate-400">{node.mac}</td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            node.status === 'Online'
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                              : node.status === 'Booting'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span
                          className={`font-bold ${
                            node.status === 'Online'
                              ? 'text-emerald-400'
                              : node.status === 'Booting'
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {node.status}
                        </span>
                        <span className="text-[10px] text-slate-500">({node.pingMs}ms)</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1 w-28">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">CPU</span>
                          <span className="text-sky-400 font-bold">{node.cpuUsagePct}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-400 h-full"
                            style={{ width: `${node.cpuUsagePct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300">
                      {node.currentUser}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerNodeMac(node.mac);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Drawer for Node Detail */}
      <NodeDetailDrawer
        nodeMac={drawerNodeMac}
        onClose={() => setDrawerNodeMac(null)}
      />
    </motion.div>
  );
};

export default NodesView;
