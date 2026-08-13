import React, { useState } from 'react';
import { Layers, Plus, Activity, CheckCircle, Clock, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { PXEImageDetail } from '../../types';

export type { PXEImageDetail };

interface GarosPxeRepoProps {
  pxeImages: PXEImageDetail[];
  onCreateImage: (name: string, kernel: string, args: string) => void;
  networkTrafficData: Array<{ time: string; rx: number; tx: number }>;
}

export const GarosPxeRepo: React.FC<GarosPxeRepoProps> = ({
  pxeImages,
  onCreateImage,
  networkTrafficData,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImageName, setNewImageName] = useState('');
  const [newImageKernel, setNewImageKernel] = useState('6.6.21-garos-lts');
  const [newImageArgs, setNewImageArgs] = useState('initrd=initrd ip=dhcp console=ttyS0 boot.shell_on_fail');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageName) return;
    onCreateImage(newImageName, newImageKernel, newImageArgs);
    setNewImageName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* PXE Images Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Layers size={18} className="text-purple-400" />
              Repositório de Imagens PXE (Boot GarOS)
            </h3>
            <p className="text-xs text-slate-400">
              Imagens e kernels declarativos pré-compilados do GAROS
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500 hover:text-slate-950 font-extrabold text-[11px] rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          >
            <Plus size={14} /> Nova Imagem Nix
          </button>
        </div>

        {/* Add Form Drawer */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="p-4 bg-slate-950/80 border border-purple-500/30 rounded-xl space-y-3 overflow-hidden text-xs"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                  Nome da Derivação PXE
                </label>
                <input
                  type="text"
                  placeholder="Ex: GarOS-Kiosk-2026-v1"
                  value={newImageName}
                  onChange={(e) => setNewImageName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-400 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                  Kernel
                </label>
                <input
                  type="text"
                  value={newImageKernel}
                  onChange={(e) => setNewImageKernel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                  Parâmetros de Boot do Kernel (Append)
                </label>
                <input
                  type="text"
                  value={newImageArgs}
                  onChange={(e) => setNewImageArgs(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-500 text-slate-950 font-black rounded-lg hover:bg-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  COMPILAR (NIX-BUILD)
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* List of PXE Images */}
        <div className="space-y-3">
          {pxeImages.map((img) => (
            <div
              key={img.id}
              className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-purple-400" />
                  <span className="text-xs font-bold text-white font-mono">{img.name}</span>
                </div>
                <span
                  className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                    img.status === 'Active'
                      ? 'bg-kve-success/15 text-kve-success border border-kve-success/30'
                      : img.status === 'Compiling'
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {img.status === 'Active' ? 'ATIVO' : img.status === 'Compiling' ? 'COMPILANDO...' : 'INATIVO'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
                <div>Kernel: <span className="text-slate-200">{img.kernel}</span></div>
                <div>Tamanho: <span className="text-slate-200">{img.sizeMb} MB</span></div>
              </div>

              <div className="space-y-1">
                <div className="text-[9px] font-mono text-slate-500 uppercase">Parâmetros Boot:</div>
                <div className="text-[10px] font-mono text-purple-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80 select-all truncate">
                  {img.args}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Traffic Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-2 uppercase">
            <Activity size={14} className="text-kve-accent" />
            Tráfego de Boot (NFS / TFTP)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Pico: 1.2 GB/s</span>
        </div>
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={networkTrafficData}>
              <defs>
                <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070a13',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              />
              <Area type="monotone" dataKey="rx" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRx)" name="NFS Read (MB/s)" />
              <Area type="monotone" dataKey="tx" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorTx)" name="NFS Write (MB/s)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GarosPxeRepo;
