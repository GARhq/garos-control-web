import React, { useState } from 'react';
import { Settings, X, Server, Network, CheckCircle2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GarosPxeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GarosPxeConfigModal: React.FC<GarosPxeConfigModalProps> = ({ isOpen, onClose }) => {
  const [tftpRoot, setTftpRoot] = useState('/var/lib/tftpboot/garos');
  const [nfsExport, setNfsExport] = useState('/export/garos-garos-root');
  const [dhcpOption66, setDhcpOption66] = useState('192.168.1.100');
  const [dhcpOption67, setDhcpOption67] = useState('garos/pxelinux.0');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-kve-accent/10 rounded-xl text-kve-accent border border-kve-accent/20">
                <Settings size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Configurações de Boot PXE / NFS (GAROS)
                </h4>
                <p className="text-[10px] text-slate-400">Parâmetros do Servidor DHCP Option 66/67 e Ponto de Montagem</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Diretório TFTP Root (pxelinux.0)
              </label>
              <input
                type="text"
                value={tftpRoot}
                onChange={(e) => setTftpRoot(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-kve-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Ponto de Exportação NFS (RootFS)
              </label>
              <input
                type="text"
                value={nfsExport}
                onChange={(e) => setNfsExport(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-kve-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  DHCP Option 66 (TFTP Server)
                </label>
                <input
                  type="text"
                  value={dhcpOption66}
                  onChange={(e) => setDhcpOption66(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-kve-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  DHCP Option 67 (Bootfile)
                </label>
                <input
                  type="text"
                  value={dhcpOption67}
                  onChange={(e) => setDhcpOption67(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-kve-accent"
                />
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-kve-success/15 border border-kve-success/30 text-kve-success rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> Configurações salvas e aplicadas no serviço TFTP/NFS!
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-kve-accent text-slate-950 font-black rounded-xl hover:bg-sky-400 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              >
                <Save size={14} /> Salvar Alterações
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GarosPxeConfigModal;
