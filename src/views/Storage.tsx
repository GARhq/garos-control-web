import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  HardDrive, 
  History, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Trash2, 
  RefreshCw, 
  Network,
  Play,
  FolderPlus,
  Clock,
  RotateCcw
} from 'lucide-react';
import KveCard from '../components/KveCard';
import Modal from '../components/Modal';
import { useGarosStore } from '../store/useGarosStore';

const StorageView: React.FC = () => {
  const btrfsPoolUsagePct = useGarosStore((s) => s.btrfsPoolUsagePct);
  const isScrubRunning = useGarosStore((s) => s.isScrubRunning);
  const scrubProgressPct = useGarosStore((s) => s.scrubProgressPct);
  const scrubEta = useGarosStore((s) => s.scrubEta);
  const startBtrfsScrub = useGarosStore((s) => s.startBtrfsScrub);
  const drives = useGarosStore((s) => s.drives);
  const snapshots = useGarosStore((s) => s.snapshots);
  const rollbackSnapshot = useGarosStore((s) => s.rollbackSnapshot);
  const createSnapshot = useGarosStore((s) => s.createSnapshot);
  const userRole = useGarosStore((s) => s.userRole);

  const [rollbackConfirmId, setRollbackConfirmId] = useState<string | null>(null);
  const [isNewSnapshotModalOpen, setIsNewSnapshotModalOpen] = useState(false);
  const [snapName, setSnapName] = useState('snap-manual-' + Date.now().toString().slice(-4));
  const [snapSubvol, setSnapSubvol] = useState('/export/home');

  const selectedRollbackSnap = snapshots.find((s) => s.id === rollbackConfirmId);

  const handleConfirmRollback = () => {
    if (rollbackConfirmId) {
      rollbackSnapshot(rollbackConfirmId);
      setRollbackConfirmId(null);
    }
  };

  const handleCreateSnapshotSubmit = () => {
    if (!snapName.trim()) return;
    createSnapshot(snapName.trim(), snapSubvol);
    setIsNewSnapshotModalOpen(false);
    setSnapName('snap-manual-' + Date.now().toString().slice(-4));
  };

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
            <Database size={22} className="text-sky-400" />
            <span>Armazenamento do Servidor, BTRFS & NFS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitoramento de pool de dados, integridade de blocos via scrub e versionamento por snapshots.
          </p>
        </div>
        <button 
          onClick={() => setIsNewSnapshotModalOpen(true)}
          disabled={userRole === 'user'}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-extrabold transition-all flex items-center gap-2 shadow-lg ${
            userRole === 'user'
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-900/40'
          }`}
        >
          <Layers size={16} /> NOVO SNAPSHOT
        </button>
      </div>

      {/* BTRFS Pool Usage Gauge Card */}
      <KveCard 
        title="BTRFS Master Storage Pool" 
        subtitle="Subvolumes /export/home e /export/nix-store" 
        icon={<HardDrive size={16} />}
      >
        <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex flex-col items-center justify-center w-36 h-36 rounded-full border-8 border-sky-500/10 bg-sky-500/5 relative shrink-0">
            <div className="text-center z-10 font-mono">
              <p className="text-3xl font-black text-white">{btrfsPoolUsagePct}%</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ocupado</p>
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Capacidade Total</p>
                <p className="text-lg font-black text-white">37.84 TB</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Espaço Usado</p>
                <p className="text-lg font-black text-sky-400">23.46 TB</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Livre Real</p>
                <p className="text-lg font-black text-emerald-400">14.38 TB</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Snapshots Total</p>
                <p className="text-lg font-black text-amber-400">{snapshots.length} Snaps</p>
              </div>
            </div>

            {/* Scrub Realtime Animated Bar */}
            {isScrubRunning ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-sky-500/40 space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-400">BTRFS SCRUB EM EXECUÇÃO:</span>
                  <span className="text-white font-bold">{scrubProgressPct}% (ETA: {scrubEta})</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full transition-all duration-300" style={{ width: `${scrubProgressPct}%` }} />
                </div>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <ShieldCheck size={16} />
                  <span>Nenhum erro de integridade detectado no pool.</span>
                </div>
                <button
                  onClick={startBtrfsScrub}
                  disabled={userRole === 'user'}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Play size={13} />
                  <span>Iniciar Scrub</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </KveCard>

      {/* Drives Hardware SMART Badges */}
      <KveCard title="Unidades Físicas & Status SMART" icon={<HardDrive size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {drives.map((d) => (
            <div key={d.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  d.type === 'NVMe' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {d.type}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  d.smartStatus === 'OK' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  SMART: {d.smartStatus}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-white leading-snug">{d.model}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tamanho: {d.size}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Temp: <strong className="text-white">{d.tempC}°C</strong></span>
                <span>R/W: <strong className="text-sky-400">{d.readSpeed}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </KveCard>

      {/* Snapshots Timeline Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-sky-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">Histórico de Snapshots (Retenção 30 dias)</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{snapshots.length} Pontos Gravados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4">Nome do Snapshot</th>
                <th className="p-4">Subvolume</th>
                <th className="p-4">Data de Criação</th>
                <th className="p-4">Tamanho</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-sky-400">{snap.name}</td>
                  <td className="p-4 text-slate-300">{snap.subvolume}</td>
                  <td className="p-4 text-slate-400">{snap.timestamp} ({snap.daysAgo}d atrás)</td>
                  <td className="p-4 font-bold text-white">{snap.sizeMb} MB</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setRollbackConfirmId(snap.id)}
                      disabled={userRole === 'user'}
                      className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ml-auto"
                    >
                      <RotateCcw size={13} />
                      <span>Restaurar Rollback</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {selectedRollbackSnap && (
        <Modal
          isOpen={!!selectedRollbackSnap}
          onClose={() => setRollbackConfirmId(null)}
          title={`Confirmar Rollback: ${selectedRollbackSnap.name}`}
          type="warning"
          footer={
            <div className="flex justify-end gap-3">
              <button onClick={() => setRollbackConfirmId(null)} className="px-4 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white">CANCELAR</button>
              <button onClick={handleConfirmRollback} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-mono font-extrabold text-xs">EXECUTAR ROLLBACK</button>
            </div>
          }
        >
          <div className="space-y-3 font-mono">
            <p className="text-xs text-slate-300">
              Você está prestes a restaurar o subvolume <strong className="text-sky-400">{selectedRollbackSnap.subvolume}</strong> para o estado do snapshot <strong className="text-white">{selectedRollbackSnap.name}</strong> gravado em {selectedRollbackSnap.timestamp}.
            </p>
            <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200">
              <strong>AVISO:</strong> Modificações posteriores a este ponto de restauração serão sobrescritas pelo estado do snapshot.
            </div>
          </div>
        </Modal>
      )}

      {/* Create Snapshot Modal */}
      <Modal
        isOpen={isNewSnapshotModalOpen}
        onClose={() => setIsNewSnapshotModalOpen(false)}
        title="Criar Novo Snapshot BTRFS"
        type="info"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsNewSnapshotModalOpen(false)} className="px-4 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white">CANCELAR</button>
            <button onClick={handleCreateSnapshotSubmit} className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-mono font-extrabold text-xs">GERAR SNAPSHOT</button>
          </div>
        }
      >
        <div className="space-y-4 font-mono">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Identificador do Snapshot</label>
            <input
              type="text"
              value={snapName}
              onChange={(e) => setSnapName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Subvolume Alvo</label>
            <select
              value={snapSubvol}
              onChange={(e) => setSnapSubvol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="/export/home">/export/home (Diretórios Home de Usuários)</option>
              <option value="/export/nix-store">/export/nix-store (Imagens de Boot PXE)</option>
            </select>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default StorageView;
