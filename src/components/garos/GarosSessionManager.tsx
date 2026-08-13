import React, { useState } from 'react';
import { User, LogOut, MessageSquare, Send, CheckCircle2, Shield, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveSession } from '../../types';

export type { ActiveSession };

interface GarosSessionManagerProps {
  sessions: ActiveSession[];
  onKillSession: (id: string) => void;
  onBroadcastMessage: (msg: string, targetId?: string) => void;
}

export const GarosSessionManager: React.FC<GarosSessionManagerProps> = ({
  sessions,
  onKillSession,
  onBroadcastMessage,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!messageText.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      onBroadcastMessage(messageText, selectedSessionId || undefined);
      setIsSending(false);
      setMessageText('');
      setSelectedSessionId(null);
    }, 600);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <User size={18} className="text-kve-accent" />
            Sessões de Usuários Conectados
          </h3>
          <p className="text-xs text-slate-400">
            Sessões ativas em execução nos terminais magros de trabalho
          </p>
        </div>
        <button
          onClick={() => setSelectedSessionId(selectedSessionId === 'ALL' ? null : 'ALL')}
          className="px-3 py-1.5 bg-kve-accent/15 border border-kve-accent/30 text-kve-accent hover:bg-kve-accent hover:text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
        >
          <MessageSquare size={13} /> Transmitir Mensagem
        </button>
      </div>

      {/* Sessions Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-500 bg-slate-900/60 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Operador / IP</th>
              <th className="py-3 px-4">Servidor Terminal</th>
              <th className="py-3 px-4">Uso CPU / RAM</th>
              <th className="py-3 px-4">Tempo Inativo</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                  Nenhuma sessão de usuário ativa no momento.
                </td>
              </tr>
            ) : (
              sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Operator */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <User size={13} className="text-kve-accent" />
                      {sess.username}
                    </div>
                    <div className="text-[10px] text-slate-500">{sess.deviceIp}</div>
                  </td>

                  {/* Server */}
                  <td className="py-3 px-4 font-bold text-slate-400">{sess.terminalServer}</td>

                  {/* Usage */}
                  <td className="py-3 px-4">
                    <div className="space-y-1 w-28">
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>CPU: {sess.cpuPct}%</span>
                        <span>RAM: {sess.memPct}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-kve-accent h-full" style={{ width: `${sess.cpuPct}%` }} />
                        <div className="bg-emerald-500 h-full" style={{ width: `${sess.memPct}%` }} />
                      </div>
                    </div>
                  </td>

                  {/* Idle Time */}
                  <td className="py-3 px-4 text-slate-400">{sess.idleTime}</td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        sess.status === 'Active'
                          ? 'bg-kve-success/15 text-kve-success border border-kve-success/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sess.status === 'Active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedSessionId(sess.id)}
                        className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] transition-colors"
                        title="Enviar mensagem para este usuário"
                      >
                        <MessageSquare size={12} />
                      </button>
                      <button
                        onClick={() => onKillSession(sess.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 hover:bg-red-900 hover:text-white font-extrabold text-[10px] transition-all flex items-center gap-1"
                        title="Encerrar sessão forçadamente"
                      >
                        <LogOut size={11} /> Desconectar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Message Composer Area */}
      <AnimatePresence>
        {selectedSessionId && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="p-4 bg-slate-950/90 border border-kve-accent/40 rounded-xl space-y-3 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <MessageSquare size={14} className="text-kve-accent" />
                Mensagem para Terminal:{' '}
                <strong className="text-kve-accent">
                  {selectedSessionId === 'ALL'
                    ? 'TODOS OS TERMINAIS CONECTADOS'
                    : sessions.find((s) => s.id === selectedSessionId)?.username || 'Operador'}
                </strong>
              </span>
              <button
                onClick={() => setSelectedSessionId(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Digite a mensagem que será exibida no terminal..."
              className="w-full h-20 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-kve-accent transition-colors resize-none font-sans"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedSessionId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !messageText.trim()}
                className="px-4 py-1.5 bg-kve-accent text-slate-950 font-black text-xs rounded-xl hover:bg-sky-400 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              >
                {isSending ? 'Transmitindo...' : 'Enviar Alerta'}
                <Send size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GarosSessionManager;
