import React, { useState, useEffect, useRef } from 'react';
import { Search, Monitor, Database, Clock, ChevronRight, X, Server, Layers, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchResult {
  id: string;
  type: string;
  label: string;
  node?: string;
  status?: string;
}

const SearchOverlay: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (res: any) => void }> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const mockData: SearchResult[] = [
    { id: '00:1A:2B:3C:4D:5E', type: 'terminal', label: 'thin-client-01 (aguiarrocha)', node: '192.168.1.150', status: 'online' },
    { id: '00:1A:2B:3C:4D:5F', type: 'terminal', label: 'thin-client-02 (operator-01)', node: '192.168.1.151', status: 'online' },
    { id: '00:1A:2B:3C:4D:60', type: 'terminal', label: 'lab-pc-01 (LIGANDO...)', node: '192.168.1.152', status: 'booting' },
    { id: '00:1A:2B:3C:4D:62', type: 'terminal', label: 'gate-term-03 (user-alpha)', node: '192.168.1.154', status: 'online' },
    { id: 'img-01', type: 'pxe', label: 'GarOS-Thin-Client-v2.6', node: 'Boot PXE/NFS', status: 'active' },
    { id: 'img-02', type: 'pxe', label: 'GAROS-Rescue-Shell-v1.4', node: 'Boot PXE/NFS', status: 'active' },
    { id: 'nfs-share', type: 'service', label: 'NFS RootFS Export (/export/garos)', node: 'NFS Server', status: 'active' },
    { id: 'tftp-daemon', type: 'service', label: 'TFTP PXE Server (Port 69)', node: 'TFTP Server', status: 'active' },
  ];

  const filtered = query.length > 0 
    ? mockData.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) || 
        item.id.toLowerCase().includes(query.toLowerCase()) ||
        (item.node && item.node.toLowerCase().includes(query.toLowerCase()))
      )
    : mockData.slice(0, 6);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'terminal': return <Monitor size={14} className="text-kve-accent" />;
      case 'pxe': return <Layers size={14} className="text-purple-400" />;
      case 'service': return <Server size={14} className="text-kve-success" />;
      default: return <Search size={14} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[15vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-kve-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-kve-border bg-slate-900 flex items-center gap-4">
           <Search size={20} className="text-kve-accent" />
           <input 
             ref={inputRef}
             type="text" 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Buscar estações físicas, MAC, IP ou imagens PXE..." 
             className="flex-1 bg-transparent border-none text-base text-white focus:outline-none placeholder:text-slate-600 font-medium"
           />
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-kve-border tracking-widest">ESC</span>
              <button 
                onClick={onClose}
                className="p-1 text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
           </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2 no-scrollbar">
           {filtered.length > 0 ? (
             <div className="space-y-1">
               {filtered.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => {
                     onSelect(item);
                     onClose();
                   }}
                   className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-kve-accent/10 group transition-all"
                 >
                   <div className="flex items-center gap-4">
                     <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-kve-accent/20 transition-colors">
                        {getIcon(item.type)}
                     </div>
                     <div className="text-left">
                       <p className="text-sm font-bold text-slate-200 group-hover:text-kve-accent transition-colors">{item.label}</p>
                       <p className="text-[10px] text-slate-500 uppercase font-mono tracking-tight">
                         {item.type} {item.node && `• ${item.node}`} • ID: {item.id}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     {item.status && (
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.status === 'online' || item.status === 'active' ? 'bg-kve-success/10 text-kve-success' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {item.status}
                        </span>
                     )}
                     <ChevronRight size={14} className="text-slate-600 group-hover:text-kve-accent group-hover:translate-x-1 transition-all" />
                   </div>
                 </button>
               ))}
             </div>
           ) : (
             <div className="py-12 text-center text-slate-600">
                <Search size={32} className="mx-auto mb-4 opacity-10" />
                <p className="text-sm font-medium uppercase tracking-widest">Nenhum resultado para "{query}"</p>
             </div>
           )}
        </div>

        <div className="p-3 bg-slate-950/50 border-t border-kve-border flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-600">
           <div className="flex gap-4">
              <span>↑↓ Navegar</span>
              <span>↵ Selecionar</span>
           </div>
           <div>
              GAROS Search Engine
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchOverlay;
