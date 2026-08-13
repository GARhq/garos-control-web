import React from 'react';
import { Activity, Server, Database, Globe, Play, Square, RotateCcw } from 'lucide-react';
import { useGarosStore } from '../../store/useGarosStore';

const GarosCoreServices: React.FC = () => {
  const services = useGarosStore((s) => s.services);
  const toggleServiceStatus = useGarosStore((s) => s.toggleServiceStatus);
  const restartService = useGarosStore((s) => s.restartService);
  const userRole = useGarosStore((s) => s.userRole);

  const coreDaemons = ['nfs-kernel-server', 'tftp-server', 'dnsmasq', 'garos-wol-proxy'];
  const displayServices = services.filter((s) => coreDaemons.includes(s.name));

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md font-mono">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
          <Activity size={16} className="text-kve-accent" /> Daemons Principais
        </h3>
      </div>
      
      <div className="space-y-3">
        {displayServices.map((srv) => (
          <div key={srv.name} className="flex flex-col gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {srv.name.includes('nfs') ? <Database size={14} className="text-indigo-400" /> : 
                 srv.name.includes('tftp') ? <Server size={14} className="text-emerald-400" /> :
                 srv.name.includes('dns') ? <Globe size={14} className="text-sky-400" /> :
                 <Activity size={14} className="text-amber-400" />}
                <span className="text-xs font-bold text-slate-200 uppercase">{srv.name}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest ${
                  srv.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  srv.status === 'failed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {srv.status}
                </span>
                
                <button
                  onClick={() => restartService(srv.name)}
                  disabled={userRole === 'user'}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all disabled:opacity-50"
                  title="Reiniciar Daemon"
                >
                  <RotateCcw size={12} />
                </button>
                <button
                  onClick={() => toggleServiceStatus(srv.name)}
                  disabled={userRole === 'user'}
                  className={`p-1 rounded-lg transition-all disabled:opacity-50 ${
                    srv.status === 'active'
                      ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                  title={srv.status === 'active' ? 'Parar Serviço' : 'Iniciar Serviço'}
                >
                  {srv.status === 'active' ? <Square size={12} /> : <Play size={12} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GarosCoreServices;
