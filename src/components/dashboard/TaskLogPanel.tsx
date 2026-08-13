import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, List, X, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaskDetailModal from './TaskDetailModal';

interface TaskLogPanelProps {
  collapsed?: boolean;
}

const TaskLogPanel: React.FC<TaskLogPanelProps> = ({ collapsed = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  useEffect(() => {
    const mockTasks = [
      { id: 'GAROS:pxe-boot:001', node: 'garos-primary', user: 'aguiarrocha', description: 'Boot PXE thin-client-01 (192.168.1.150)', status: 'OK', startTime: new Date(Date.now() - 50000).toISOString(), endTime: new Date(Date.now() - 40000).toISOString() },
      { id: 'GAROS:nfs-mount:002', node: 'garos-primary', user: 'operator-01', description: 'Montagem NFS RootFS lab-pc-01', status: 'OK', startTime: new Date(Date.now() - 150000).toISOString(), endTime: new Date(Date.now() - 140000).toISOString() },
      { id: 'GAROS:nix-build:003', node: 'garos-primary', user: 'aguiarrocha', description: 'Compilação Imagem GarOS-Thin-Client-v2.6', status: 'RUNNING', startTime: new Date(Date.now() - 300000).toISOString(), endTime: null },
      { id: 'GAROS:wol-signal:004', node: 'garos-primary', user: 'aguiarrocha', description: 'Transmissão Magic Packet WOL gate-term-03', status: 'OK', startTime: new Date(Date.now() - 500000).toISOString(), endTime: new Date(Date.now() - 450000).toISOString() },
    ];

    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/cluster/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        } else {
          setTasks(mockTasks);
        }
      } catch (e) {
        console.warn('Backend indisponível. Usando Mocks para TaskLog.');
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`fixed bottom-8 right-0 z-30 transition-all duration-300 ${
        collapsed ? 'left-16' : 'left-64'
      } ${isExpanded ? 'h-64' : 'h-8'}`}
    >
      {/* Small Toggle Bar */}
      <div 
        className="h-8 bg-slate-900 border-t border-kve-border flex items-center justify-between px-4 cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <List size={12} />
            <span>Tarefas Recentes</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-kve-success flex items-center gap-1 font-mono">
               <CheckCircle2 size={10} /> 4 OK
             </span>
             <span className="text-[10px] text-kve-warning flex items-center gap-1 animate-pulse font-mono">
               <Clock size={10} /> 1 RUNNING
             </span>
          </div>
        </div>
        <div className="text-slate-500 hover:text-white transition-colors">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full bg-[#0a0a0a] backdrop-blur-md overflow-hidden flex flex-col font-mono text-[11px]"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {tasks.length === 0 ? (
                <div className="text-slate-500">Loading task history...</div>
              ) : (
                tasks.map((task, i) => {
                  const isOk = task.status === 'OK';
                  const isRunning = task.status === 'RUNNING';
                  const statusColor = isOk ? 'text-green-500' : isRunning ? 'text-yellow-500' : 'text-red-500';
                  const timestamp = new Date(task.startTime).toLocaleTimeString();
                  
                  return (
                    <div 
                      key={i} 
                      className="flex gap-3 hover:bg-slate-900/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                      }}
                    >
                      <span className="text-slate-600 shrink-0">[{timestamp}]</span>
                      <span className={`${statusColor} shrink-0 w-16`}>[{task.status}]</span>
                      <span className="text-slate-400 shrink-0 w-16">{task.node}</span>
                      <span className="text-slate-200">{task.description}</span>
                      <span className="text-slate-600 ml-auto hidden sm:inline-block truncate max-w-[200px]">{task.id}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TaskDetailModal 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  );
};

export default TaskLogPanel;
