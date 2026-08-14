import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet, 
  useNavigate, 
  useLocation, 
  useParams 
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MobileBottomNav from './components/MobileBottomNav';
import GarosWebTerminalModal from './components/GarosWebTerminalModal';
import LoginView from './views/Login';
import UsersView from './views/Users';
import ServicesView from './views/Services';
import StorageView from './views/Storage';
import MonitoringView from './views/Monitoring';
import GatewayView from './views/Gateway';
import LogsView from './views/Logs';
import SettingsView from './views/Settings';
import ThinkServerView from './views/ThinkServer';
import NodesView from './views/Nodes';
import ResourceView from './views/ResourceView';
import BackgroundMosaic from './components/BackgroundMosaic';
import TaskLogPanel from './components/dashboard/TaskLogPanel';
import { ViewType } from './types';
import { useGarosRealtime } from './hooks/useGarosRealtime';
import { applyTheme } from './utils/theme';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-8 w-screen h-screen bg-black">
          <h1>Something went wrong.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrapper to extract dynamic params from React Router and pass them to ResourceView
const ResourceViewWrapper: React.FC<{ setSelectedResource: (res: any) => void }> = ({ setSelectedResource }) => {
  const { type, id } = useParams();
  
  const idLabels: Record<string, string> = {
    'garos-01': 'GAROS Netboot Server',
    'garos-pxe-images': 'Imagens Boot PXE/NFS',
    'garos-img-1': 'GarOS-Thin-Client-v2.6',
    'garos-img-2': 'GAROS-Rescue-Shell-v1.4',
    'garos-img-3': 'Alpine-Diskless-GAROS-v3.19',
    'garos-fleet': 'Estações Físicas Diskless',
    'garos-dev-1': 'thin-client-01 (aguiarrocha)',
    'garos-dev-2': 'thin-client-02 (operator-01)',
    'garos-dev-3': 'lab-pc-01 (Booting...)',
    'garos-dev-4': 'gate-term-03 (user-alpha)'
  };

  useEffect(() => {
    if (type && id) {
      setSelectedResource({
        id,
        type,
        label: idLabels[id] || id
      });
    }
  }, [type, id]);

  return (
    <ResourceView 
      key={id}
      type={type as any} 
      id={id!} 
      label={idLabels[id!] || id!} 
    />
  );
};

// Main Layout component with persistent Sidebar and Topbar (does not unmount on navigate)
const MainLayout: React.FC<{
  onLogout: () => void;
  selectedResource: {id: string, type: any, label: string};
  setSelectedResource: (res: any) => void;
}> = ({ onLogout, selectedResource, setSelectedResource }) => {
  // Mount global realtime telemetry polling (2s interval)
  useGarosRealtime();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [thinkServerActive, setThinkServerActive] = useState(() => localStorage.getItem('kve_node_server') === 'true');
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to map pathname to current ViewType
  const getViewType = (): ViewType => {
    const path = location.pathname.substring(1);
    if (path.startsWith('resource/')) {
      const parts = path.split('/');
      return (parts[1] || 'node-server') as ViewType;
    }
    return (path || 'node-server') as ViewType;
  };

  const currentView = getViewType();

  const handleThinkServerToggle = () => {
    const nextVal = !thinkServerActive;
    setThinkServerActive(nextVal);
    localStorage.setItem('kve_node_server', String(nextVal));
    if (nextVal) {
      navigate('/node-server');
    } else {
      navigate('/node-server');
    }
  };

  const handleQuickWol = async () => {
    try {
      await fetch('/api/garos/nodes/bulk/wol', { method: 'POST' });
      navigate('/node-server');
    } catch {
      navigate('/node-server');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-kve-bg overflow-hidden selection:bg-kve-accent/30 selection:text-white relative pb-14 sm:pb-0">
      <BackgroundMosaic />

      {/* Persistent Sidebar with Mobile Drawer support */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          if (view === 'node-server') {
            setThinkServerActive(true);
            localStorage.setItem('kve_node_server', 'true');
          } else {
            setThinkServerActive(false);
            localStorage.setItem('kve_node_server', 'false');
          }
          navigate(`/${view}`);
        }} 
        onResourceSelect={(res) => {
          setSelectedResource({ id: res.id, type: res.type, label: res.label });
          navigate(`/resource/${res.type}/${res.id}`);
        }}
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        thinkServerActive={thinkServerActive}
        setThinkServerActive={setThinkServerActive}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Topbar 
          currentView={currentView} 
          selectedResource={selectedResource} 
          thinkServerActive={thinkServerActive}
          onThinkServerToggle={handleThinkServerToggle}
          onResourceSelect={(res) => {
             setSelectedResource({ id: res.id, type: res.type, label: res.label });
             navigate(`/resource/${res.type}/${res.id}`);
          }}
          onLogout={onLogout}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* The active route's component is loaded here seamlessly inside the Outlet */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <TaskLogPanel collapsed={collapsed} />

        {/* Mobile Floating Quick Action Bottom Dock */}
        <MobileBottomNav
          currentView={currentView}
          onViewChange={(view) => {
            if (view === 'node-server') {
              setThinkServerActive(true);
              localStorage.setItem('kve_node_server', 'true');
            } else {
              setThinkServerActive(false);
              localStorage.setItem('kve_node_server', 'false');
            }
            navigate(`/${view}`);
          }}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onQuickWol={handleQuickWol}
          onlineCount={3}
          totalCount={4}
        />

        {/* Web Terminal Modal */}
        <GarosWebTerminalModal
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
        />

        {/* Desktop Footer / Status Bar */}
        <footer className="glass h-8 hidden sm:flex items-center justify-between px-8 border-t border-kve-border z-40 shrink-0">
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-kve-success shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span>Gateway: Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-kve-success shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span>NFS: Healthy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-kve-success shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span>TFTP: Active</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <button 
              onClick={onLogout}
              className="hover:text-kve-danger transition-colors uppercase"
            >
              LOGOUT
            </button>
            <span>v1.2.4-stable</span>
            <span>© 2026 GAROS OS</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{id: string, type: any, label: string}>({ 
    id: 'garos-01', 
    type: 'datacenter', 
    label: 'GAROS Cluster' 
  });

  // Apply saved visual theme and check session on mount
  useEffect(() => {
    applyTheme();
    const session = localStorage.getItem('kve_session');
    if (session === 'active') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('kve_session', 'active');
    localStorage.setItem('kve_node_server', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('kve_session');
    localStorage.removeItem('kve_operational_scope');
    localStorage.removeItem('kve_remote_ip');
  };

  const InitialRedirect = () => {
    return <Navigate to="/node-server" replace />;
  };

  return (
    <Router>
      <Routes>
        {isLoggedIn ? (
          <Route 
            element={
              <MainLayout 
                onLogout={handleLogout} 
                selectedResource={selectedResource}
                setSelectedResource={setSelectedResource}
              />
            }
          >
            {/* Core GAROS Routes */}
            <Route path="/node-server" element={<ThinkServerView />} />
            <Route path="/dashboard" element={<ThinkServerView />} />
            <Route path="/nodes" element={<NodesView />} />
            <Route path="/users" element={<UsersView />} />
            <Route path="/services" element={<ServicesView />} />
            <Route path="/storage" element={<StorageView />} />
            <Route path="/monitoring" element={<MonitoringView />} />
            <Route path="/gateway" element={<GatewayView />} />
            <Route path="/logs" element={<LogsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/resource/:type/:id" element={<ResourceViewWrapper setSelectedResource={setSelectedResource} />} />
            {/* Fallback routing */}
            <Route path="*" element={<InitialRedirect />} />
          </Route>
        ) : (
          <Route path="*" element={<LoginView onLogin={handleLogin} />} />
        )}
      </Routes>
    </Router>
  );
};

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
