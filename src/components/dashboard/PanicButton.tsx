import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useGarosStore } from '../../store/useGarosStore';

export const PanicButtonCard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  
  const panicModeActive = useGarosStore((s) => s.panicModeActive);
  const panicCooldown = useGarosStore((s) => s.panicCooldown);
  const triggerPanicMode = useGarosStore((s) => s.triggerPanicMode);
  const deactivatePanicMode = useGarosStore((s) => s.deactivatePanicMode);
  const userRole = useGarosStore((s) => s.userRole);

  const handleConfirmPanic = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput.trim().toUpperCase() === 'PANIC') {
      const success = triggerPanicMode(confirmInput);
      if (success) {
        setIsModalOpen(false);
        setConfirmInput('');
      }
    }
  };

  return (
    <>
      <div className={`p-5 rounded-2xl border transition-all ${
        panicModeActive 
          ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.3)]' 
          : 'bg-slate-900/60 border-rose-900/40 hover:border-rose-500/50'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${panicModeActive ? 'bg-rose-600 text-white animate-bounce' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                Botão de Pânico Operacional
                {panicModeActive && <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500 text-white font-mono uppercase">ATIVO</span>}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Ação emergencial de contenção: aplica DROP imediato no firewall NFTables e desconecta todas as sessões ativas.
              </p>
            </div>
          </div>

          <div>
            {panicModeActive ? (
              <button
                onClick={deactivatePanicMode}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold font-mono transition-all uppercase"
              >
                Normalizar Operação
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={panicCooldown || userRole === 'user'}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase font-mono tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                  panicCooldown || userRole === 'user'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 active:scale-95'
                }`}
              >
                {panicCooldown ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Cooldown (5s)</span>
                  </>
                ) : userRole === 'user' ? (
                  <>
                    <Lock size={14} />
                    <span>Requer Admin/Operator</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <span>ATIVAR PÂNICO</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span className="text-rose-400 font-bold">Quando utilizar:</span>
          <span>Invasão detectada</span>
          <span>•</span>
          <span>Ataque DDoS / Flooding de Rede</span>
          <span>•</span>
          <span>Comando descontrolado em lote</span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <ShieldAlert size={28} />
              <h3 className="text-lg font-black text-white uppercase">Confirmação de Pânico</h3>
            </div>

            <div className="p-3 bg-rose-950/50 border border-rose-900/50 rounded-xl text-xs text-rose-200 leading-relaxed">
              <strong>ATENÇÃO:</strong> Esta ação bloqueia todo o tráfego não essencial na rede e força o encerramento imediato de conexões ativas.
            </div>

            <form onSubmit={handleConfirmPanic} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Digite a palavra <span className="text-rose-400 font-mono font-black">PANIC</span> para habilitar a execução:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="PANIC"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white uppercase focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setConfirmInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={confirmInput.trim().toUpperCase() !== 'PANIC'}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold font-mono uppercase transition-all ${
                    confirmInput.trim().toUpperCase() === 'PANIC'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  EXECTUAR PÂNICO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PanicButtonCard;
