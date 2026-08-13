import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Settings, 
  Terminal, 
  Monitor, 
  Cpu, 
  HardDrive as Database, 
  History, 
  Zap,
  ShieldCheck,
  Server,
  Network,
  Lock,
  Box,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import KveCard from '../components/KveCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import TerminalConsole from '../components/dashboard/TerminalConsole';
import StorageContentView from '../components/dashboard/StorageContentView';
import { useGarosStore } from '../store/useGarosStore';
import { Power, RotateCw, Play } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ResourceViewProps {
  type: 'server' | 'folder' | 'image' | 'station';
  id: string;
  label: string;
}

const mockChartData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  cpu: Math.random() * 30 + 10,
  mem: Math.random() * 40 + 20,
}));

const ResourceView: React.FC<ResourceViewProps> = ({ type, id, label }) => {
  const [activeTab, setActiveTab] = useState('summary');

  // Lookup real resource data from the Zustand store (falls back to undefined if id not in store)
  const stationData = useGarosStore((s) =>
    s.nodes.find((n) => n.mac === id || n.hostname === id)
  );

  const tabs = [
    { id: 'summary', label: 'Sumário', icon: Activity },
    { id: 'hardware', label: 'Hardware', icon: Cpu, hidden: type !== 'station' && type !== 'server' },
    { id: 'network', label: 'Rede', icon: Network, hidden: type !== 'station' && type !== 'server' },
    { id: 'storage', label: 'Armazenamento', icon: Database, hidden: type !== 'server' },
    { id: 'options', label: 'Opções', icon: Settings },
    { id: 'console', label: 'Console', icon: Terminal, hidden: type !== 'station' },
  ].filter(tab => !tab.hidden);

  useEffect(() => {
    const currentTabHidden = tabs.find(t => t.id === activeTab)?.hidden;
    if (currentTabHidden) {
      setActiveTab('summary');
    }
  }, [type]);

  const renderSummary = () => {
    if (type === 'station') {
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <button className="px-6 py-2 bg-kve-success/10 border border-kve-success/30 text-kve-success font-bold uppercase tracking-wider rounded-lg hover:bg-kve-success hover:text-white transition-all flex items-center gap-2 text-xs">
              <Zap size={14} /> Wake on LAN
            </button>
            <button className="px-6 py-2 bg-kve-warning/10 border border-kve-warning/30 text-kve-warning font-bold uppercase tracking-wider rounded-lg hover:bg-kve-warning hover:text-white transition-all flex items-center gap-2 text-xs">
              <Activity size={14} /> Reboot OS
            </button>
            <button className="px-6 py-2 bg-kve-danger/10 border border-kve-danger/30 text-kve-danger font-bold uppercase tracking-wider rounded-lg hover:bg-kve-danger hover:text-white transition-all flex items-center gap-2 text-xs">
              <Monitor size={14} /> Shutdown
            </button>
            <div className="w-px h-6 bg-slate-700 mx-2" />
            <button 
              onClick={() => setActiveTab('console')}
              className="px-6 py-2 bg-kve-accent text-kve-bg font-bold uppercase tracking-wider rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center gap-2 text-xs"
            >
              <Terminal size={14} /> SSH Web Console
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <KveCard title="Status da Estação Diskless" className="h-full">
                <div className="flex flex-col h-full justify-center space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kve-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-kve-success"></span>
                    </div>
                    <span className="text-2xl font-black text-white tracking-widest uppercase">ONLINE</span>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Uptime</span>
                      <span className="text-sm text-slate-300 font-mono">14d 08h 12m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Endereço IP</span>
                      <span className="text-sm text-kve-accent font-mono">192.168.1.101</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">MAC Address</span>
                      <span className="text-sm text-slate-300 font-mono">00:1A:2B:3C:4D:01</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Imagem PXE</span>
                      <span className="text-sm text-slate-300 font-mono">GarOS-Thin-Client-v2.6</span>
                    </div>
                  </div>
                </div>
              </KveCard>
            </div>

            <div className="space-y-6">
              <KveCard title="Métricas Locais" className="h-full">
                <div className="space-y-8 py-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Cpu size={14} /> CPU Usage
                      </span>
                      <div className="text-right">
                        <span className="text-xl font-black text-white">45%</span>
                        <span className="text-[10px] text-slate-500 block">de 4 Cores</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-kve-success via-kve-warning to-kve-danger h-full" style={{ width: '45%' }} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} /> RAM Usage
                      </span>
                      <div className="text-right">
                        <span className="text-xl font-black text-white">3.2 GB</span>
                        <span className="text-[10px] text-slate-500 block">de 8.0 GB (40%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-kve-success via-kve-warning to-kve-danger h-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Network size={14} /> Latência NFS
                      </span>
                      <div className="text-right">
                        <span className="text-xl font-black text-white">0.4 ms</span>
                        <span className="text-[10px] text-slate-500 block">RootFS Overlay</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-kve-success via-kve-warning to-kve-danger h-full" style={{ width: '5%' }} />
                    </div>
                  </div>
                </div>
              </KveCard>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'image') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KveCard title="Status da Imagem" className="bg-slate-900/40">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-kve-success/10 text-kve-success">
                   <Zap size={20} />
                 </div>
                 <div>
                   <p className="text-xl font-bold text-white uppercase tracking-tight">Ativa</p>
                   <p className="text-[10px] text-slate-500 uppercase font-mono">Disponível via TFTP</p>
                 </div>
              </div>
            </KveCard>
            <KveCard title="Tamanho Base" className="bg-slate-900/40">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-kve-indigo/10 text-kve-indigo">
                   <HardDrive size={20} />
                 </div>
                 <div>
                   <p className="text-xl font-bold text-white uppercase tracking-tight">1.2 GB</p>
                   <p className="text-[10px] text-slate-500 uppercase font-mono">SquashFS</p>
                 </div>
              </div>
            </KveCard>
            <KveCard title="Estações Conectadas" className="bg-slate-900/40">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-kve-accent/10 text-kve-accent">
                   <Monitor size={20} />
                 </div>
                 <div>
                   <p className="text-xl font-bold text-white uppercase tracking-tight">4</p>
                   <p className="text-[10px] text-slate-500 uppercase font-mono">Atualmente</p>
                 </div>
              </div>
            </KveCard>
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KveCard title="Status" className="bg-slate-900/40">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-full bg-kve-success/10 text-kve-success">
               <Zap size={20} />
             </div>
             <div>
               <p className="text-xl font-bold text-white uppercase tracking-tight">Online</p>
               <p className="text-[10px] text-slate-500 uppercase font-mono">Uptime: 12d 5h 22m</p>
             </div>
          </div>
        </KveCard>
        <KveCard title="Uso de CPU (Servidor)" className="bg-slate-900/40">
           <div className="space-y-2">
             <div className="flex justify-between text-xs">
               <span className="text-slate-400">12.5% de 16 Cores</span>
             </div>
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-kve-accent" style={{ width: '12.5%' }} />
             </div>
           </div>
        </KveCard>
        <KveCard title="Memória" className="bg-slate-900/40">
           <div className="space-y-2">
             <div className="flex justify-between text-xs">
               <span className="text-slate-400">42.1 GB de 128 GB</span>
             </div>
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-kve-indigo" style={{ width: '32.8%' }} />
             </div>
           </div>
        </KveCard>
        <KveCard title="Rede" className="bg-slate-900/40">
           <div className="flex items-center gap-4">
             <div className="flex-1">
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">In</p>
               <p className="text-sm font-mono text-kve-success">12.4 Mbps</p>
             </div>
             <div className="flex-1">
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Out</p>
               <p className="text-sm font-mono text-kve-warning">4.2 Mbps</p>
             </div>
           </div>
        </KveCard>
      </div>

      {/* Charts */}
      {type === 'server' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KveCard title="Carga de CPU (Servidor Principal)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0b14', border: '1px solid #1e293b' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#38bdf8" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </KveCard>
          <KveCard title="Consumo de Memória (Servidor Principal)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0b14', border: '1px solid #1e293b' }}
                    itemStyle={{ color: '#6366f1' }}
                  />
                  <Area type="monotone" dataKey="mem" stroke="#6366f1" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </KveCard>
        </div>
      )}
    </div>
    );
  };

  // Hardware tab — for stations & servers
  const renderHardware = () => {
    const cpuCores = stationData?.cpuCores ?? 4;
    const ramGb = stationData?.ramGb ?? 8;
    const cpuTempC = stationData?.cpuTempC ?? 45;
    const memUsagePct = stationData?.memUsagePct ?? 35;
    const cpuUsagePct = stationData?.cpuUsagePct ?? 20;
    const fanRpm = stationData?.fanSpeedRpm ?? 0;
    const hardwareModel = stationData?.hardwareModel ?? 'Generic x86_64 Diskless Station';

    return (
      <div className="space-y-6">
        <KveCard title="Processador (CPU)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Metric label="Modelo" value={hardwareModel} mono />
            <Metric label="Núcleos Físicos" value={`${cpuCores} cores`} />
            <Metric label="Temperatura" value={`${cpuTempC}°C`} accent={cpuTempC > 75 ? 'danger' : cpuTempC > 60 ? 'warning' : 'success'} />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Carga atual</span>
              <span className="text-kve-accent font-mono font-bold">{cpuUsagePct}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-kve-success via-kve-warning to-kve-danger" style={{ width: `${cpuUsagePct}%` }} />
            </div>
          </div>
        </KveCard>

        <KveCard title="Memória RAM">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Metric label="Total" value={`${ramGb} GB`} />
            <Metric label="Em uso" value={`${(ramGb * memUsagePct / 100).toFixed(1)} GB`} />
            <Metric label="Disponível" value={`${(ramGb * (100 - memUsagePct) / 100).toFixed(1)} GB`} accent="success" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Ocupação</span>
              <span className="text-kve-indigo font-mono font-bold">{memUsagePct}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-kve-indigo" style={{ width: `${memUsagePct}%` }} />
            </div>
          </div>
        </KveCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KveCard title="Cooler / Fan">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${fanRpm > 0 ? 'bg-kve-accent/10 text-kve-accent' : 'bg-slate-800 text-slate-600'}`}>
                <Activity size={28} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{fanRpm > 0 ? `${fanRpm} RPM` : 'N/A'}</p>
                <p className="text-[10px] text-slate-500 uppercase font-mono">{fanRpm > 0 ? 'Ventoinha ativa' : 'Fanless / sem sensor'}</p>
              </div>
            </div>
          </KveCard>

          <KveCard title="Firmware (BIOS/UEFI)">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between"><span className="text-slate-500">Boot Mode</span><span className="text-slate-300">UEFI / PXE</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Secure Boot</span><span className="text-kve-success">Disabled</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Wake-on-LAN</span><span className="text-kve-success">Enabled</span></div>
            </div>
          </KveCard>
        </div>
      </div>
    );
  };

  // Network tab — for stations & servers
  const renderNetwork = () => {
    const ip = stationData?.ip ?? '10.0.1.50';
    const mac = stationData?.mac ?? '00:1A:2B:3C:4D:00';
    const pingMs = stationData?.pingMs ?? 2;
    const nfsLatencyMs = stationData?.nfsLatencyMs ?? 0.5;
    const networkLink = stationData?.networkLink ?? '1 Gbps';

    // Mock interface traffic series
    const trafficSeries = Array.from({ length: 20 }, (_, i) => ({
      t: i,
      rx: Math.round(40 + Math.sin(i / 2) * 30 + Math.random() * 10),
      tx: Math.round(20 + Math.cos(i / 2) * 15 + Math.random() * 8),
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KveCard title="Endereçamento">
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between"><span className="text-slate-500">IPv4</span><span className="text-kve-accent font-bold">{ip}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">MAC Address</span><span className="text-slate-300">{mac}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Gateway</span><span className="text-slate-300">10.0.1.1</span></div>
              <div className="flex justify-between"><span className="text-slate-500">DNS Primário</span><span className="text-slate-300">10.0.1.1</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Máscara</span><span className="text-slate-300">255.255.255.0</span></div>
            </div>
          </KveCard>

          <KveCard title="Conectividade">
            <div className="space-y-4">
              <Metric label="Latência ICMP" value={`${pingMs} ms`} accent={pingMs > 50 ? 'warning' : 'success'} />
              <Metric label="Latência NFS RootFS" value={`${nfsLatencyMs} ms`} accent="success" />
              <Metric label="Link Speed" value={networkLink} />
              <Metric label="Status DHCP" value="Bound" accent="success" />
            </div>
          </KveCard>
        </div>

        <KveCard title="Tráfego de Rede (últimos 20s)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficSeries}>
                <defs>
                  <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0b14', border: '1px solid #1e293b' }} />
                <Area type="monotone" dataKey="rx" name="RX ↓" stroke="#10b981" fill="url(#colorRx)" strokeWidth={2} />
                <Area type="monotone" dataKey="tx" name="TX ↑" stroke="#f59e0b" fill="url(#colorTx)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </KveCard>
      </div>
    );
  };

  // Options tab — actions & settings for any resource type
  const renderOptions = () => {
    const isStation = type === 'station' || type === 'server';
    const hostname = stationData?.hostname ?? label;
    const assignedImage = stationData?.assignedImageId ?? '—';

    return (
      <div className="space-y-6">
        {isStation && (
          <KveCard title="Controle de Energia">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ActionButton
                icon={Play}
                label="Wake-on-LAN"
                description="Enviar magic packet para a MAC"
                color="success"
                onClick={() => alert(`WoL enviado para ${stationData?.mac ?? id}`)}
              />
              <ActionButton
                icon={RotateCw}
                label="Reiniciar"
                description="Shutdown + boot via PXE"
                color="warning"
                onClick={() => confirm(`Reiniciar ${hostname}?`)}
              />
              <ActionButton
                icon={Power}
                label="Desligar"
                description="Shutdown limpo do sistema"
                color="danger"
                onClick={() => confirm(`Desligar ${hostname}?`)}
              />
            </div>
          </KveCard>
        )}

        <KveCard title="Identidade do Recurso">
          <div className="space-y-3 text-xs font-mono">
            <EditableRow label="Hostname" value={hostname} />
            <EditableRow label="ID Interno" value={id} disabled />
            <EditableRow label="Tipo" value={type.toUpperCase()} disabled />
            {isStation && <EditableRow label="Imagem PXE Atribuída" value={assignedImage} />}
            {isStation && (
              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-kve-accent/10 text-kve-accent text-xs font-bold uppercase tracking-wider hover:bg-kve-accent/20">
                  Trocar Imagem PXE
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-700">
                  Reimagem Forçada
                </button>
              </div>
            )}
          </div>
        </KveCard>

        {type === 'image' && (
          <KveCard title="Ações da Imagem">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ActionButton icon={RotateCw} label="Recompilar" description="Rebuild do SquashFS" color="accent" onClick={() => alert('Recompilação iniciada')} />
              <ActionButton icon={Power} label="Desativar" description="Impedir boot desta imagem" color="danger" onClick={() => confirm('Desativar esta imagem?')} />
            </div>
          </KveCard>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full space-y-4"
    >
      <div className="flex items-center justify-between bg-slate-900/60 p-4 border border-kve-border rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-kve-accent/10 rounded-lg text-kve-accent">
            {type === 'server' ? <Server size={24} /> : type === 'station' ? <Monitor size={24} /> : type === 'image' ? <HardDrive size={24} /> : <Box size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">{label}</h2>
              <span className="px-2 py-0.5 rounded bg-kve-success/20 text-kve-success text-[10px] font-bold uppercase">Online</span>
            </div>
            <p className="text-xs text-slate-500 font-mono tracking-tight">{type.toUpperCase()} ID: {id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors">
             <Settings size={18} />
           </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-900/40 p-1 border border-kve-border rounded-lg overflow-x-auto whitespace-nowrap no-scrollbar shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-widest",
              activeTab === tab.id 
                ? "bg-kve-accent text-kve-bg shadow-[0_0_10px_rgba(56,189,248,0.3)]" 
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'hardware' && renderHardware()}
            {activeTab === 'network' && renderNetwork()}
            {activeTab === 'options' && renderOptions()}
            {activeTab === 'console' && <TerminalConsole nodeId={id} nodeName={label} />}
            {activeTab === 'storage' && <StorageContentView storageId={id} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Helper sub-components used by the tabs above ──────────────────────────────

const Metric: React.FC<{
  label: string;
  value: string;
  accent?: 'success' | 'warning' | 'danger';
  mono?: boolean;
}> = ({ label, value, accent, mono }) => {
  const colorMap = {
    success: 'text-kve-success',
    warning: 'text-kve-warning',
    danger: 'text-kve-danger',
  };
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</span>
      <span className={`text-sm font-bold ${accent ? colorMap[accent] : 'text-white'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
};

const ActionButton: React.FC<{
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  description: string;
  color: 'success' | 'warning' | 'danger' | 'accent';
  onClick: () => void;
}> = ({ icon: Icon, label, description, color, onClick }) => {
  const colorMap = {
    success: 'border-kve-success/30 bg-kve-success/5 text-kve-success hover:bg-kve-success hover:text-kve-bg',
    warning: 'border-kve-warning/30 bg-kve-warning/5 text-kve-warning hover:bg-kve-warning hover:text-kve-bg',
    danger: 'border-kve-danger/30 bg-kve-danger/5 text-kve-danger hover:bg-kve-danger hover:text-white',
    accent: 'border-kve-accent/30 bg-kve-accent/5 text-kve-accent hover:bg-kve-accent hover:text-kve-bg',
  };
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-2 p-4 border rounded-xl text-left transition-all ${colorMap[color]}`}
    >
      <Icon size={20} className="shrink-0" />
      <div>
        <p className="text-xs font-black uppercase tracking-widest">{label}</p>
        <p className="text-[10px] opacity-70 mt-0.5">{description}</p>
      </div>
    </button>
  );
};

const EditableRow: React.FC<{ label: string; value: string; disabled?: boolean }> = ({ label, value, disabled }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  if (disabled) {
    return (
      <div className="flex justify-between">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-300">{value}</span>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-slate-500 shrink-0">{label}</span>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { setEditing(false); /* TODO: persist via store/api */ }}
          onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
          className="flex-1 bg-slate-950 border border-kve-accent/50 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div
      className="flex justify-between cursor-pointer hover:bg-slate-800/30 -mx-2 px-2 py-1 rounded"
      onClick={() => setEditing(true)}
    >
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
};

export default ResourceView;
