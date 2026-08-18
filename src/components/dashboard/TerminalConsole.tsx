import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Maximize2, Trash2, Power } from 'lucide-react';
import { motion } from 'motion/react';

interface TerminalConsoleProps {
  nodeId: string;
  nodeName: string;
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({ nodeId, nodeName }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial terminal state
    const fetchTerminal = async () => {
      try {
        const res = await fetch(`/api/nodes/${nodeId}/terminal`);
        const data = await res.json();
        setHistory(data.output.split('\n'));
        setLoading(false);
      } catch (e) {
        setHistory(['Error connecting to terminal...', 'Retrying...']);
        setLoading(false);
      }
    };
    fetchTerminal();
  }, [nodeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newHistory = [...history, `root@${nodeName}:~# ${input}`];
    
    // Simple command simulation
    let response = '';
    const cmd = input.toLowerCase().trim();
    
    if (cmd === 'clear') {
      setHistory([`root@${nodeName}:~# `]);
      setInput('');
      return;
    } else if (cmd === 'ls') {
      response = 'bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var';
    } else if (cmd === 'whoami') {
      response = 'root';
    } else if (cmd === 'top' || cmd === 'htop') {
      response = 'Tasks: 185 total,   1 running, 184 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  2.7 us,  1.2 sy,  0.0 ni, 95.8 id,  0.0 wa,  0.0 hi,  0.3 si,  0.0 st\nMiB Mem :  16000.0 total,   4200.5 free,   8100.2 used,   3699.3 buff/cache';
    } else if (cmd === 'garversion' || cmd === 'gar --version') {
      response = 'gar version 1.1.0-lts (running kernel: 6.6.21-garos-lts)';
    } else if (cmd === 'help') {
      response = 'Available commands: ls, whoami, top, htop, garversion, clear, help';
    } else {
      response = `-bash: ${input}: command not found`;
    }

    setHistory([...newHistory, response, `root@${nodeName}:~# `]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-black border border-kve-border rounded-xl overflow-hidden shadow-2xl font-mono">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-kve-border">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-kve-success" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Console: {nodeName} ({nodeId})
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-white transition-colors">
            <Maximize2 size={14} />
          </button>
          <button 
            onClick={() => setHistory([`root@${nodeName}:~# `])}
            className="text-slate-500 hover:text-kve-danger transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button className="flex items-center gap-1 text-[10px] font-bold text-kve-warning border border-kve-warning/30 px-2 py-0.5 rounded hover:bg-kve-warning/10 transition-colors">
            <Power size={10} /> RESTART
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 text-sm text-kve-success leading-relaxed custom-scrollbar selection:bg-kve-success selection:text-black"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-kve-success rounded-full animate-ping" />
            <span>Connecting to shell...</span>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap mb-2">
              {history.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            <form onSubmit={handleCommand} className="flex">
              <span className="text-kve-success mr-2 shrink-0">root@{nodeName}:~#</span>
              <input
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-kve-success focus:ring-0 p-0"
              />
            </form>
          </>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-1.5 bg-slate-900/50 border-t border-kve-border flex items-center justify-between">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
          Connected via SSH/VNC Proxy
        </div>
        <div className="flex gap-4 text-[10px] font-bold">
           <span className="text-kve-success">AES-256-GCM</span>
           <span className="text-slate-400">LATENCY: 12ms</span>
        </div>
      </div>
    </div>
  );
};

export default TerminalConsole;
