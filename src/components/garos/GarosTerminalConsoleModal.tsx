import React, { useState, useEffect } from 'react';
import { Terminal, X, Power, RefreshCw, Play, CheckCircle2, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NetbootDevice } from './GarosTerminalTable';

interface GarosTerminalConsoleModalProps {
  device: NetbootDevice | null;
  onClose: () => void;
  onReboot: (mac: string) => void;
}

export const GarosTerminalConsoleModal: React.FC<GarosTerminalConsoleModalProps> = ({
  device,
  onClose,
  onReboot,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [commandInput, setCommandInput] = useState('');

  useEffect(() => {
    if (!device) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const initialLogs = [
      `[GAROS-VNC-CLIENT] Initiating remote console session for ${device.hostname} (${device.ip})`,
      `[GAROS-KERNEL] Linux kernel 6.6.21-garos-lts x86_64 initialized`,
      `[GAROS-NETBOOT] NFS RootFS mounted at /export/garos-thin-client`,
      `[GAROS-SYSTEMD] Reached target Multi-User System.`,
      `[GAROS-DISPLAY] X11 / Wayland Compositor active on tty7`,
      `[GAROS-HEALTH] CPU: 12% | RAM: 1.8GB / ${device.ramGb}GB | Latency: 0.8ms`,
      `Type 'help' or 'status' for quick diagnostics...`,
    ];
    setLogs(initialLogs);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [device, onClose]);

  if (!device) return null;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim().toLowerCase();
    let response = `bash: command not found: ${cmd}`;

    if (cmd === 'help') {
      response = `Available commands: help, status, ping, dmesg, reboot, clear`;
    } else if (cmd === 'status') {
      response = `[GAROS-STATUS] Host: ${device.hostname} | IP: ${device.ip} | MAC: ${device.mac} | Status: OK`;
    } else if (cmd === 'ping') {
      response = `PING 192.168.1.1 (gateway): 56 data bytes\n64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.412 ms`;
    } else if (cmd === 'dmesg') {
      response = `[    0.000000] Linux version 6.6.21-garos-lts (nix@garos-builder)
[    0.000000] Command line: initrd=initrd ip=dhcp alpine_dev=nfs
[    1.204120] garos-net: eth0: link up, 1000Mbps, full-duplex`;
    } else if (cmd === 'clear') {
      setLogs([]);
      setCommandInput('');
      return;
    } else if (cmd === 'reboot') {
      onReboot(device.mac);
      response = `[GAROS-KERNEL] Reboot signal sent to ${device.hostname}...`;
    }

    setLogs((prev) => [...prev, `$ ${commandInput}`, response]);
    setCommandInput('');
  };

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-4xl bg-[#090d16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[580px] cursor-default"
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-kve-accent/10 rounded-xl text-kve-accent border border-kve-accent/30">
                <Terminal size={16} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Console Remoto VNC: <span className="text-kve-accent">{device.hostname}</span>
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span>IP: {device.ip}</span>
                  <span>•</span>
                  <span>MAC: {device.mac}</span>
                  <span>•</span>
                  <span className="text-kve-success font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-kve-success animate-pulse" /> SESSÃO ATIVA
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onReboot(device.mac)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                title="Reiniciar terminal remoto"
              >
                <Power size={12} /> Reiniciar
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-mono text-xs font-black border border-red-500/40 transition-all flex items-center gap-1 shadow-md active:scale-95"
                title="Fechar Console (ESC ou Clicar Fora)"
              >
                <X size={16} />
                <span>FECHAR</span>
              </button>
            </div>
          </div>

          {/* Terminal Screen Container */}
          <div className="flex-1 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2 select-text custom-scrollbar">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.startsWith('$')
                    ? 'text-white font-bold'
                    : log.includes('ERR') || log.includes('failed')
                    ? 'text-red-400'
                    : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))}
          </div>

          {/* Terminal Input Bar */}
          <form
            onSubmit={handleCommandSubmit}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <span className="text-kve-accent font-mono text-xs font-bold pl-2">$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Digite um comando remoto (ex: status, help, ping, reboot)..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-kve-accent text-slate-950 font-bold text-xs rounded-lg hover:bg-sky-400 transition-colors"
            >
              Executar
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GarosTerminalConsoleModal;
