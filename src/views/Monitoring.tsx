import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  Zap, 
  Clock, 
  Server, 
  Pause, 
  Play, 
  RefreshCw,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import KveCard from '../components/KveCard';

interface MetricPoint {
  time: string;
  cpu: number;
  ram: number;
  net: number;
  disk: number;
}

const initialChartData: MetricPoint[] = [
  { time: '10:00', cpu: 12, ram: 45, net: 120, disk: 15 },
  { time: '10:05', cpu: 18, ram: 46, net: 150, disk: 18 },
  { time: '10:10', cpu: 15, ram: 45, net: 130, disk: 14 },
  { time: '10:15', cpu: 25, ram: 48, net: 210, disk: 22 },
  { time: '10:20', cpu: 22, ram: 47, net: 180, disk: 19 },
  { time: '10:25', cpu: 30, ram: 50, net: 250, disk: 25 },
  { time: '10:30', cpu: 28, ram: 49, net: 220, disk: 21 },
];

const MonitoringView: React.FC = () => {
  const [chartData, setChartData] = useState<MetricPoint[]>(initialChartData);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'availability'>('overview');

  // Simulate real-time metric updates every 3 seconds
  useEffect(() => {
    if (!isLiveFeedActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const lastPoint = chartData[chartData.length - 1] || { cpu: 20, ram: 48, net: 200, disk: 20 };
      const newCpu = Math.min(95, Math.max(8, lastPoint.cpu + Math.floor(Math.random() * 11) - 5));
      const newRam = Math.min(90, Math.max(30, lastPoint.ram + Math.floor(Math.random() * 5) - 2));
      const newNet = Math.min(500, Math.max(50, lastPoint.net + Math.floor(Math.random() * 41) - 20));
      const newDisk = Math.min(100, Math.max(5, lastPoint.disk + Math.floor(Math.random() * 9) - 4));

      const newPoint: MetricPoint = {
        time: timeStr,
        cpu: newCpu,
        ram: newRam,
        net: newNet,
        disk: newDisk
      };

      setChartData((prev) => [...prev.slice(-11), newPoint]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveFeedActive, chartData]);

  const currentCpu = chartData[chartData.length - 1]?.cpu ?? 28;
  const currentRam = chartData[chartData.length - 1]?.ram ?? 49;
  const currentNet = chartData[chartData.length - 1]?.net ?? 220;
  const currentDisk = chartData[chartData.length - 1]?.disk ?? 21;

  const availabilityServices = [
    { name: 'KVE Control Plane daemon', status: 'ONLINE', latency: '1.2ms', uptime: '99.99%', category: 'Core Service' },
    { name: 'WoL Broadcast Gateway', status: 'ONLINE', latency: '0.4ms', uptime: '100%', category: 'Network' },
    { name: 'NFS Export Server v4', status: 'ONLINE', latency: '2.1ms', uptime: '99.95%', category: 'Storage' },
    { name: 'BTRFS Subvolume Scrub Engine', status: 'IDLE', latency: '0.8ms', uptime: '100%', category: 'Storage' },
    { name: 'Cluster Heartbeat Agent', status: 'ONLINE', latency: '3.5ms', uptime: '99.98%', category: 'Cluster' },
    { name: 'DHCP/DNS Probe Interceptor', status: 'ONLINE', latency: '1.1ms', uptime: '100%', category: 'Network' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Monitoramento em Tempo Real & Disponibilidade</h2>
          <p className="text-slate-500 text-sm">Métricas ao vivo de CPU, RAM, I/O e matriz de saúde dos serviços KVE</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-slate-900 border border-kve-border rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                activeTab === 'overview' ? 'bg-kve-accent text-kve-bg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Métricas Live
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                activeTab === 'availability' ? 'bg-kve-accent text-kve-bg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Matriz de Serviços
            </button>
          </div>

          <button
            onClick={() => setIsLiveFeedActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${
              isLiveFeedActive 
                ? 'bg-kve-success/10 border-kve-success/30 text-kve-success' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isLiveFeedActive ? (
              <>
                <div className="w-2 h-2 rounded-full bg-kve-success animate-pulse" />
                <Pause size={14} /> LIVE ATIVO
              </>
            ) : (
              <>
                <Play size={14} /> PAUSADO
              </>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KveCard 
              title={`Utilização de CPU (${currentCpu}%)`} 
              subtitle="Carga em tempo real por núcleo" 
              icon={<Cpu size={16} />}
            >
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0b14', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }} />
                    <Area type="monotone" dataKey="cpu" stroke="#38bdf8" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </KveCard>

            <KveCard 
              title={`Memória RAM (${currentRam}%)`} 
              subtitle="Alocação de memória física" 
              icon={<Database size={16} />}
            >
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0b14', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }} />
                    <Area type="monotone" dataKey="ram" stroke="#1d4ed8" fillOpacity={1} fill="url(#colorRam)" strokeWidth={2} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </KveCard>

            <KveCard 
              title={`Tráfego de Rede (${currentNet} Mbps)`} 
              subtitle="Throughput de entrada/saída" 
              icon={<Network size={16} />}
            >
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0b14', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="net" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3, fill: '#38bdf8' }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </KveCard>

            <KveCard 
              title={`I/O de Disco (${currentDisk} MB/s)`} 
              subtitle="Operações de leitura/escrita" 
              icon={<Zap size={16} />}
            >
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0b14', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }} />
                    <Bar dataKey="disk" fill="#1d4ed8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </KveCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KveCard className="glass-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-kve-accent/10 rounded-lg text-kve-accent">
                  <Clock size={20} />
                </div>
                <span className="text-[10px] font-bold text-kve-success bg-kve-success/10 px-2 py-0.5 rounded-full">ESTÁVEL</span>
              </div>
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Uptime do Servidor</h4>
              <p className="text-2xl font-bold text-white">12d 4h 32m</p>
            </KveCard>

            <KveCard className="glass-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-kve-warning/10 rounded-lg text-kve-warning">
                  <Server size={20} />
                </div>
                <span className="text-[10px] font-bold text-kve-warning bg-kve-warning/10 px-2 py-0.5 rounded-full">NORMAL</span>
              </div>
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Temperatura CPU</h4>
              <p className="text-2xl font-bold text-white">42°C</p>
            </KveCard>

            <KveCard className="glass-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-kve-success/10 rounded-lg text-kve-success">
                  <Activity size={20} />
                </div>
                <span className="text-[10px] font-bold text-kve-success bg-kve-success/10 px-2 py-0.5 rounded-full">ATIVO</span>
              </div>
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Processos em Execução</h4>
              <p className="text-2xl font-bold text-white">242</p>
            </KveCard>
          </div>
        </>
      ) : (
        /* Availability Services Matrix */
        <KveCard title="Disponibilidade e SLA de Serviços do Servidor" icon={<ShieldCheck size={18} />} noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-kve-border bg-slate-900/20">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Serviço / Daemon</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status de Saúde</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latência Resposta</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">SLA Disponibilidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kve-border">
                {availabilityServices.map((srv) => (
                  <tr key={srv.name} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Radio size={16} className="text-kve-accent" />
                        <span className="text-sm font-bold text-white">{srv.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-400">{srv.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-kve-success" />
                        <span className="text-[10px] font-bold text-kve-success uppercase tracking-widest">{srv.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-300">{srv.latency}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-mono font-bold text-sky-400">{srv.uptime}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </KveCard>
      )}
    </motion.div>
  );
};

export default MonitoringView;

