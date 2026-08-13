import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  Monitor, 
  UploadCloud, 
  Settings, 
  ShieldAlert, 
  Activity, 
  Network, 
  FileText, 
  Server,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Box,
  Cpu,
  HardDrive,
  Globe,
  Layers,
  Terminal,
  Zap,
  X
} from 'lucide-react';
import { ViewType, ResourceTreeNode } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ContextMenu from './ContextMenu';
import logoImg from '../assets/images/kryonix_logo_1784247250954.jpg';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onResourceSelect: (resource: {id: string, type: any, label: string}) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  thinkServerActive?: boolean;
  setThinkServerActive?: (active: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ResourceTree: React.FC<{
  node: ResourceTreeNode;
  depth: number;
  onSelect: (node: ResourceTreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: ResourceTreeNode) => void;
  selectedId?: string;
}> = ({ node, depth, onSelect, onContextMenu, selectedId }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server size={14} className="text-kve-accent" />;
      case 'folder': return <Database size={14} className="text-slate-400" />;
      case 'image': return <HardDrive size={14} className="text-kve-indigo" />;
      case 'station': return <Monitor size={14} className="text-kve-success" />;
      default: return <Box size={14} />;
    }
  };

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center gap-2 py-1 px-2 cursor-pointer rounded-sm text-xs transition-colors",
          selectedId === node.id ? "bg-kve-accent/20 text-kve-accent" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          onSelect(node);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(e, node);
        }}
      >
        {hasChildren ? (
          <ChevronDown size={12} className={cn("transition-transform", !isOpen && "-rotate-90")} />
        ) : (
          <div className="w-3" />
        )}
        {getIcon(node.type)}
        <span className="truncate">{node.label}</span>
        {node.status && (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full ml-auto",
            node.status === 'online' || node.status === 'running' ? "bg-kve-success" : "bg-kve-danger"
          )} />
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="mt-0.5">
          {node.children!.map(child => (
            <ResourceTree 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  onResourceSelect, 
  collapsed, 
  setCollapsed,
  thinkServerActive = false,
  setThinkServerActive,
  mobileOpen = false,
  onMobileClose
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('garos-01');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: any } | null>(null);

  const garosTree: ResourceTreeNode = {
    id: 'garos-01',
    type: 'server',
    label: 'GAROS Netboot Server',
    children: [
      {
        id: 'garos-pxe-images',
        type: 'folder',
        label: 'Imagens Boot PXE/NFS',
        status: 'online',
        children: [
          { id: 'garos-img-1', type: 'image', label: 'GarOS-Thin-Client-v2.6', status: 'running' },
          { id: 'garos-img-2', type: 'image', label: 'GAROS-Rescue-Shell-v1.4', status: 'running' },
          { id: 'garos-img-3', type: 'image', label: 'Alpine-Diskless-GAROS-v3.19', status: 'stopped' },
        ]
      },
      {
        id: 'garos-fleet',
        type: 'folder',
        label: 'Estações Físicas Diskless',
        status: 'online',
        children: [
          { id: 'garos-dev-1', type: 'station', label: 'thin-client-01 (aguiarrocha)', status: 'running' },
          { id: 'garos-dev-2', type: 'station', label: 'thin-client-02 (operator-01)', status: 'running' },
          { id: 'garos-dev-3', type: 'station', label: 'lab-pc-01 (Booting...)', status: 'stopped' },
          { id: 'garos-dev-4', type: 'station', label: 'gate-term-03 (user-alpha)', status: 'running' },
        ]
      }
    ]
  };

  const handleNodeSelect = (node: ResourceTreeNode) => {
    setSelectedNodeId(node.id);
    onViewChange('node-server');
    onResourceSelect({ id: node.id, type: node.type, label: node.label });
    if (onMobileClose) onMobileClose();
  };

  const handleContextMenu = (e: React.MouseEvent, node: ResourceTreeNode) => {
    e.preventDefault();
  };

  const menuItems = [
    { id: 'nodes', label: 'Estações Diskless', icon: Monitor },
    { id: 'node-server', label: 'Gestão de Estações', icon: Server },
    { id: 'services', label: 'Serviços & Daemons', icon: Activity },
    { id: 'storage', label: 'Armazenamento & NFS', icon: Database },
    { id: 'gateway', label: 'Rede & Subredes', icon: Network },
    { id: 'monitoring', label: 'Telemetria & Métricas', icon: Cpu },
    { id: 'users', label: 'Usuários & Permissões', icon: Users },
    { id: 'logs', label: 'Logs & Auditoria', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside className={cn(
        "glass h-screen flex flex-col transition-all duration-300 z-50 select-none shrink-0 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl",
        // Desktop positioning
        "hidden md:flex relative",
        collapsed ? "md:w-16" : "md:w-64",
        // Mobile Drawer Overlay Positioning
        mobileOpen && "!flex fixed inset-y-0 left-0 w-72 shadow-2xl animate-in slide-in-from-left duration-200"
      )}>
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80 h-14 shrink-0">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden bg-kve-accent/10 border border-kve-accent/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                <img src={logoImg} alt="GAROS Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight text-white uppercase italic leading-none">
                  GAROS
                </span>
                <span className="text-[9px] font-mono text-kve-accent tracking-widest uppercase mt-0.5">
                  Diskless OS
                </span>
              </div>
            </div>
          )}

          {/* Close button for mobile or collapse for desktop */}
          {mobileOpen ? (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          ) : (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors text-slate-400 hover:text-white mx-auto border border-transparent hover:border-slate-700"
              title={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* Scrollable Container containing Tree and Nav */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6 pb-20">
          {/* Resource Tree Section */}
          {(!collapsed || mobileOpen) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  Infra Centralizada
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  PXE/NFS
                </span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-1.5 backdrop-blur-sm">
                <ResourceTree 
                  node={garosTree} 
                  depth={0} 
                  onSelect={handleNodeSelect} 
                  onContextMenu={handleContextMenu}
                  selectedId={selectedNodeId}
                />
              </div>
            </div>
          )}

          {/* Navigation Section */}
          <div className="space-y-1.5">
            {(!collapsed || mobileOpen) && (
              <h3 className="px-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Painel Principal
              </h3>
            )}

            {menuItems.map(item => {
              const isActive = currentView === item.id || (currentView === 'dashboard' && item.id === 'node-server');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as ViewType);
                    if (onMobileClose) onMobileClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-xs font-semibold",
                    isActive
                      ? "bg-kve-accent/15 text-kve-accent border border-kve-accent/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
                  )}
                >
                  <item.icon size={18} className={cn(
                    "transition-transform duration-200 shrink-0",
                    isActive ? "scale-110 text-kve-accent" : "group-hover:scale-105 text-slate-400"
                  )} />
                  {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-kve-accent rounded-r-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
