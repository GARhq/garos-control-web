import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  X, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Trash2, 
  Plus, 
  Play, 
  Check, 
  Type, 
  Zap, 
  Monitor, 
  Server, 
  Activity 
} from 'lucide-react';

interface TerminalTab {
  id: string;
  name: string;
  history: { text: string; type: 'input' | 'output' | 'error' | 'success' | 'info' }[];
}

interface GarosWebTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GarosWebTerminalModal: React.FC<GarosWebTerminalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      name: 'garos-primary',
      history: [
        { text: '===========================================================', type: 'info' },
        { text: '  GAROS Netboot & Diskless Controller Shell v1.2.4', type: 'success' },
        { text: '  Digitar "help" para listar os comandos disponíveis.', type: 'info' },
        { text: '===========================================================', type: 'info' },
      ],
    },
    {
      id: 'tab-2',
      name: 'pxe-daemon',
      history: [
        { text: '[SYSTEM] Conectado ao socket de controle TFTP/PXE...', type: 'info' },
        { text: '[TFTP] Servidor escutando na porta 69/UDP (0.0.0.0)', type: 'success' },
        { text: '[DHCP] ProxyDHCP ativado para subrede 192.168.1.0/24', type: 'success' },
      ],
    },
  ]);

  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [copied, setCopied] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTabId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab?.history]);

  if (!isOpen) return null;

  const appendToHistory = (
    tabId: string,
    lines: { text: string; type: 'input' | 'output' | 'error' | 'success' | 'info' }[]
  ) => {
    setTabs((prevTabs) =>
      prevTabs.map((t) => (t.id === tabId ? { ...t, history: [...t.history, ...lines] } : t))
    );
  };

  const handleRunCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Add to cmd history
    setCmdHistory((prev) => [trimmed, ...prev]);
    setHistoryIdx(-1);

    // Show input in terminal
    const inputLine = { text: `root@garos-server:~# ${trimmed}`, type: 'input' as const };
    const lower = trimmed.toLowerCase();

    let outputLines: { text: string; type: 'input' | 'output' | 'error' | 'success' | 'info' }[] = [];

    if (lower === 'help') {
      outputLines = [
        { text: 'Comandos disponíveis no GAROS CLI:', type: 'info' },
        { text: '  garos status      - Exibe status do servidor e estatísticas de rede', type: 'output' },
        { text: '  pxe list          - Lista imagens de boot disponíveis para estações', type: 'output' },
        { text: '  wol <mac>         - Envia pacote Wake-on-LAN para o MAC especificado', type: 'output' },
        { text: '  ping <ip>         - Testa conectividade de rede com uma estação', type: 'output' },
        { text: '  nfs status        - Verifica compartilhamentos de disco RootFS via NFS', type: 'output' },
        { text: '  tftp status       - Verifica serviço TFTP de inicialização PXE', type: 'output' },
        { text: '  sensors           - Exibe temperaturas de CPU e velocidade de ventoinhas', type: 'output' },
        { text: '  top / btop        - Gerenciador de processos do sistema', type: 'output' },
        { text: '  clear             - Limpa o terminal atual', type: 'output' },
        { text: '  uname -a          - Exibe detalhes do kernel e sistema operacional', type: 'output' },
        { text: '  uptime            - Exibe tempo de atividade do servidor', type: 'output' },
      ];
    } else if (lower === 'clear') {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, history: [] } : t))
      );
      setInputVal('');
      return;
    } else if (lower === 'garos status' || lower === 'status') {
      outputLines = [
        { text: '▶ GAROS SERVER STATUS [ONLINE]', type: 'success' },
        { text: '  Versão: GAROS OS v1.2.4 (GarOS Bare-Metal)', type: 'output' },
        { text: '  Serviços Ativos: TFTP (Port 69), NFSv4 (Port 2049), WOL Proxy (Port 9)', type: 'output' },
        { text: '  Estações de Trabalho Físicas Conectadas: 4 / 5 ativas', type: 'output' },
        { text: '  Banda de Inicialização Atual: 1.2 Gbps (Throughput NFS OK)', type: 'info' },
      ];
    } else if (lower === 'pxe list') {
      outputLines = [
        { text: 'IMAGENS BOOT PXE/NFS CADASTRADAS:', type: 'info' },
        { text: '  [1] GarOS-Thin-Client-v2.6  (Kernel: 6.6.21-garos-lts, Tamanho: 420MB) [PADRÃO]', type: 'success' },
        { text: '  [2] GAROS-Rescue-Shell-v1.4 (Kernel: 6.1.72-rescue, Tamanho: 180MB)', type: 'output' },
        { text: '  [3] Alpine-Diskless-v3.19   (Kernel: 6.6.8-alpine, Tamanho: 95MB)', type: 'output' },
      ];
    } else if (lower.startsWith('wol')) {
      const mac = trimmed.split(' ')[1] || '00:1A:2B:3C:4D:61';
      outputLines = [
        { text: `[WOL] Enviando Magic Packet Ethernet de broadcast para ${mac}...`, type: 'info' },
        { text: `[WOL SUCCESS] Pacote transmitido via interface eth0 (UDP 255.255.255.255:9)`, type: 'success' },
        { text: `[PXE LOG] Aguardando requisição DHCP/BOOTP da estação...`, type: 'output' },
      ];
    } else if (lower.startsWith('ping')) {
      const target = trimmed.split(' ')[1] || '192.168.1.150';
      outputLines = [
        { text: `PING ${target} (${target}) 56(84) bytes of data.`, type: 'output' },
        { text: `64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.32 ms`, type: 'success' },
        { text: `64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.28 ms`, type: 'success' },
        { text: `64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.35 ms`, type: 'success' },
        { text: `--- ${target} ping statistics ---`, type: 'info' },
        { text: `3 packets transmitted, 3 received, 0% packet loss, time 2004ms`, type: 'success' },
      ];
    } else if (lower === 'nfs status') {
      outputLines = [
        { text: '[NFS SERVER] Estado: RUNNING (v4.2)', type: 'success' },
        { text: '  Export: /export/garos-rootfs (rw,async,no_root_squash)', type: 'output' },
        { text: '  Clientes Conectados: 192.168.1.150, 192.168.1.151, 192.168.1.154', type: 'output' },
        { text: '  Leituras acumuladas: 48.2 GB | Escritas acumuladas: 1.8 GB', type: 'info' },
      ];
    } else if (lower === 'tftp status') {
      outputLines = [
        { text: '[TFTP SERVER] Daemon: in.tftpd (v5.2)', type: 'success' },
        { text: '  Root Directory: /var/lib/tftpboot', type: 'output' },
        { text: '  Arquivos Servidos: pxelinux.0, ldlinux.c32, vmlinuz-6.6, initrd.img', type: 'output' },
        { text: '  Taxa de Transferência: 0 erros de bloco', type: 'success' },
      ];
    } else if (lower === 'sensors') {
      outputLines = [
        { text: 'sensores-cpu-temp (coretemp-isa-0000):', type: 'info' },
        { text: '  Package id 0:  +38.0°C  (high = +82.0°C, crit = +100.0°C)', type: 'success' },
        { text: '  Core 0:        +36.0°C  (high = +82.0°C, crit = +100.0°C)', type: 'success' },
        { text: '  Core 1:        +38.0°C  (high = +82.0°C, crit = +100.0°C)', type: 'success' },
        { text: '  Fan Speed:     1720 RPM (Pulsos OK)', type: 'info' },
      ];
    } else if (lower === 'top' || lower === 'btop') {
      outputLines = [
        { text: 'Tasks: 142 total, 1 running, 141 sleeping, 0 stopped', type: 'info' },
        { text: '%Cpu(s):  1.8 us,  0.4 sy,  0.0 ni, 97.6 id,  0.2 wa', type: 'success' },
        { text: 'MiB Mem :  16384.0 total,   8420.2 free,   3240.5 used', type: 'info' },
        { text: '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND', type: 'info' },
        { text: '  102 root      20   0  145200  32400  12400 S   0.8   0.2   0:14.20 garos-tftpd', type: 'output' },
        { text: '  108 root      20   0  210400  48200  18200 S   0.4   0.3   1:02.15 nfsd', type: 'output' },
      ];
    } else if (lower === 'uname -a') {
      outputLines = [
        { text: 'Linux garos-primary 6.6.21-garos-lts #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux', type: 'success' },
      ];
    } else if (lower === 'uptime') {
      outputLines = [
        { text: ' 08:42:10 up 4:32,  1 user,  load average: 0.18, 0.22, 0.15', type: 'success' },
      ];
    } else {
      outputLines = [
        { text: `garos-shell: comando não encontrado: "${trimmed}". Digite "help" para ver a lista de comandos.`, type: 'error' },
      ];
    }

    appendToHistory(activeTabId, [inputLine, ...outputLines]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRunCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      name: `term-${tabs.length + 1}`,
      history: [
        { text: '===========================================================', type: 'info' },
        { text: `  Nova sessão de terminal iniciada (#${tabs.length + 1})`, type: 'success' },
        { text: '===========================================================', type: 'info' },
      ],
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
  };

  const handleCopyHistory = () => {
    const text = activeTab.history.map((h) => h.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {/* Backdrop overlay - clicking anywhere outside closes terminal */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[2500] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-default ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-[640px]'
          }`}
        >
          {/* Header Bar with Tabs and Prominent Close Button */}
          <div className="bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-3 py-2 shrink-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                    activeTabId === tab.id
                      ? 'bg-slate-950 text-kve-accent border border-kve-accent/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Terminal size={13} />
                  <span>{tab.name}</span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      className="p-0.5 rounded text-slate-500 hover:text-white hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddTab}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Abrir nova aba de terminal"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Font Size Toggle */}
              <button
                onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono transition-colors flex items-center gap-1"
                title="Tamanho da fonte"
              >
                <Type size={14} />
                <span className="uppercase text-[10px]">{fontSize}</span>
              </button>

              {/* Copy */}
              <button
                onClick={handleCopyHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Copiar histórico do terminal"
              >
                {copied ? <Check size={14} className="text-kve-success" /> : <Copy size={14} />}
              </button>

              {/* Clear */}
              <button
                onClick={() => handleRunCommand('clear')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Limpar tela (clear)"
              >
                <Trash2 size={14} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isFullscreen ? 'Restaurar janela' : 'Ecrã inteiro'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              {/* Prominent Red Close Button */}
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-mono text-xs font-black border border-red-500/40 transition-all flex items-center gap-1 shadow-md active:scale-95 ml-2"
                title="Fechar Terminal (Atalho: ESC ou clicar fora)"
              >
                <X size={16} />
                <span>FECHAR</span>
              </button>
            </div>
          </div>

          {/* Quick Command Buttons Toolbar */}
          <div className="bg-slate-900/40 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold shrink-0">Ações Rápidas:</span>
            {[
              { label: 'garos status', cmd: 'garos status' },
              { label: 'pxe list', cmd: 'pxe list' },
              { label: 'nfs status', cmd: 'nfs status' },
              { label: 'tftp status', cmd: 'tftp status' },
              { label: 'sensors', cmd: 'sensors' },
              { label: 'top', cmd: 'top' },
              { label: 'help', cmd: 'help' },
            ].map((qc) => (
              <button
                key={qc.label}
                onClick={() => handleRunCommand(qc.cmd)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-kve-accent/50 text-slate-300 hover:text-kve-accent font-mono text-[10px] font-bold transition-all shrink-0"
              >
                {qc.label}
              </button>
            ))}
          </div>

          {/* Terminal Screen Body */}
          <div className="flex-1 bg-black p-4 overflow-y-auto font-mono custom-scrollbar space-y-1">
            {activeTab.history.map((item, index) => (
              <div
                key={index}
                className={`leading-relaxed whitespace-pre-wrap break-all ${
                  fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
                } ${
                  item.type === 'input'
                    ? 'text-white font-bold'
                    : item.type === 'success'
                    ? 'text-emerald-400'
                    : item.type === 'error'
                    ? 'text-rose-400 font-bold'
                    : item.type === 'info'
                    ? 'text-sky-400 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                {item.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input Prompt Footer */}
          <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono font-bold text-kve-accent shrink-0">
              root@garos-server:~#
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite um comando (ex: help, garos status, pxe list, wol)..."
              className="flex-1 bg-transparent border-none text-xs font-mono text-white focus:outline-none placeholder-slate-600"
            />
            <button
              onClick={() => handleRunCommand(inputVal)}
              className="p-1.5 rounded-lg bg-kve-accent text-slate-950 font-bold hover:bg-sky-400 transition-colors shrink-0"
              title="Executar comando"
            >
              <Play size={12} className="fill-slate-950" />
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-xs font-mono font-bold border border-slate-700 transition-all shrink-0"
              title="Sair do Terminal"
            >
              Sair [ESC]
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GarosWebTerminalModal;
