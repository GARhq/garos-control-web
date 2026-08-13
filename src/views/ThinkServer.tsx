import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Monitor, Settings, RefreshCw, Layers, ShieldCheck, CheckCircle2, Globe, Wifi, Smartphone, Laptop } from 'lucide-react';
import GarosHeaderStats from '../components/garos/GarosHeaderStats';
import GarosTerminalTable from '../components/garos/GarosTerminalTable';
import GarosPxeRepo from '../components/garos/GarosPxeRepo';
import GarosCoreServices from '../components/garos/GarosCoreServices';
import GarosSessionManager from '../components/garos/GarosSessionManager';
import GarosMobileManagerView from '../components/garos/GarosMobileManagerView';
import GarosTerminalConsoleModal from '../components/garos/GarosTerminalConsoleModal';
import GarosTerminalHealthModal from '../components/garos/GarosTerminalHealthModal';
import GarosPxeConfigModal from '../components/garos/GarosPxeConfigModal';
import ToastContainer from '../components/ToastContainer';
import { useDeviceType } from '../hooks/useDeviceType';
import { useGarosStore } from '../store/useGarosStore';
import { NetbootDevice, PXEImageDetail, ActiveSession, ToastNotification } from '../types';
import {
  fetchGarosDevices,
  fetchGarosPxeImages,
  fetchGarosSessions,
  sendWakeOnLan,
  updateDeviceImage,
  createGarosPxeImage,
  terminateSession,
  rebootTerminalDevice,
  sendTerminalMessage
} from '../services/api';

const mockPXEImages: PXEImageDetail[] = [
  { id: 'img-01', name: 'GarOS-Thin-Client-v2.6', kernel: '6.6.21-garos-lts', args: 'initrd=initrd ip=dhcp console=ttyS0 boot.shell_on_fail', sizeMb: 420, status: 'Active', lastUpdated: 'Hoje, 10:15' },
  { id: 'img-02', name: 'GAROS-Rescue-Shell-v1.4', kernel: '6.1.72-rescue', args: 'initrd=initrd_rescue ip=dhcp rescue_mode=true nomodeset', sizeMb: 180, status: 'Active', lastUpdated: 'Ontem, 18:30' },
  { id: 'img-03', name: 'Alpine-Diskless-GAROS-v3.19', kernel: '6.6.8-alpine', args: 'initrd=initramfs-alpine ip=dhcp alpine_dev=nfs', sizeMb: 95, status: 'Idle', lastUpdated: '12 Jul 2026' },
];

const networkTrafficData = Array.from({ length: 15 }, (_, i) => ({
  time: `${i * 2}m ago`,
  rx: Math.floor(Math.random() * 40 + 10),
  tx: Math.floor(Math.random() * 80 + 15),
}));

export const ThinkServerView: React.FC = () => {
  const { deviceType, activeMode, setManualOverride } = useDeviceType();
  const [pxeImages, setPxeImages] = useState<PXEImageDetail[]>(mockPXEImages);
  const [devices, setDevices] = useState<NetbootDevice[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals
  const [selectedConsoleDevice, setSelectedConsoleDevice] = useState<NetbootDevice | null>(null);
  const [selectedHealthDevice, setSelectedHealthDevice] = useState<NetbootDevice | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const services = useGarosStore((s) => s.services);
  const tftpStatus = services.find((s) => s.name === 'tftp-server')?.status;
  const nfsStatus = services.find((s) => s.name === 'nfs-kernel-server')?.status;
  const allCoreHealthy = tftpStatus === 'active' && nfsStatus === 'active';

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'danger' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const loadData = async () => {
    try {
      const [devs, imgs, sess] = await Promise.all([
        fetchGarosDevices(),
        fetchGarosPxeImages(),
        fetchGarosSessions(),
      ]);
      setDevices(devs);
      setPxeImages(imgs);
      setSessions(sess);
    } catch (e) {
      console.error("Failed to fetch GAROS data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const handleCreatePXEImage = async (name: string, kernel: string, args: string) => {
    const newImg = await createGarosPxeImage(name, kernel, args);
    setPxeImages([newImg, ...pxeImages]);
    addToast('Imagem PXE Recompilada', `A imagem ${name} foi disponibilizada no TFTP RootFS.`, 'success');
  };

  const handleDeviceImageChange = async (mac: string, imgId: string) => {
    setDevices((prev) => prev.map((dev) => (dev.mac === mac ? { ...dev, assignedImageId: imgId } : dev)));
    await updateDeviceImage(mac, imgId);
    const imgObj = pxeImages.find((i) => i.id === imgId);
    addToast('Perfil PXE Atualizado', `Perfil ${imgObj?.name || imgId} atribuído à estação ${mac}.`, 'info');
  };

  const handleWakeOnLan = async (mac: string) => {
    setDevices((prev) =>
      prev.map((dev) => (dev.mac === mac && dev.status === 'Offline' ? { ...dev, status: 'Booting' } : dev))
    );
    await sendWakeOnLan(mac);
    addToast('Sinal WOL Transmitido', `Pacote Magic Packet Wake-on-LAN enviado para ${mac}.`, 'success');

    setTimeout(() => {
      setDevices((prev) =>
        prev.map((dev) => (dev.mac === mac && dev.status === 'Booting' ? { ...dev, status: 'Online' } : dev))
      );
    }, 5000);
  };

  const handleRebootDevice = async (mac: string) => {
    setDevices((prev) => prev.map((dev) => (dev.mac === mac ? { ...dev, status: 'Booting' } : dev)));
    await rebootTerminalDevice(mac);
    addToast('Comando Reboot Transmitido', `Estação ${mac} está reiniciando via boot PXE.`, 'warning');

    setTimeout(() => {
      setDevices((prev) => prev.map((dev) => (dev.mac === mac ? { ...dev, status: 'Online' } : dev)));
    }, 5000);
  };

  const handleKillSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    await terminateSession(id);
    addToast('Sessão Encerrada', `A sessão ${id} foi encerrada pelo administrador.`, 'danger');
  };

  const handleBroadcastMessage = async (msg: string, targetId?: string) => {
    addToast('Broadcast Enviado', `Mensagem transmitida para todos os terminais ativos: "${msg}"`, 'info');
  };

  const onlineDevicesCount = devices.filter((d) => d.status === 'Online').length;
  const activeImagesCount = pxeImages.filter((i) => i.status === 'Active').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 pb-24 relative"
    >
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Network Server Access Info Banner & Device Recognition Badge */}
      <div className="px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono backdrop-blur-md">
        <div className="flex items-center gap-2 text-purple-200">
          <Globe size={15} className="text-purple-400 shrink-0" />
          <span>Acesso Central da Rede Local: <strong className="text-white underline underline-offset-2">http://192.168.1.10:3000</strong></span>
        </div>

        {/* Adaptive Device Recognition & Manual View Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider hidden md:inline">Layout Reconhecido:</span>
          
          <button
            onClick={() => setManualOverride(activeMode === 'mobile' ? 'desktop' : 'mobile')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
              activeMode === 'mobile'
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                : 'bg-kve-accent/15 border-kve-accent/40 text-kve-accent'
            }`}
          >
            {activeMode === 'mobile' ? (
              <>
                <Smartphone size={14} className="text-purple-400 animate-pulse" />
                <span>📱 Modo App Gestor (Celular)</span>
              </>
            ) : (
              <>
                <Laptop size={14} className="text-sky-400" />
                <span>💻 Modo Servidor (PC Completo)</span>
              </>
            )}
            <span className="text-[10px] underline ml-1 text-slate-400 font-normal">(Trocar)</span>
          </button>
        </div>
      </div>

      {/* RENDER ADAPTIVE VIEW ACCORDING TO RECOGNIZED DEVICE MODE */}
      {activeMode === 'mobile' ? (
        /* MOBILE / SMARTPHONE MANAGER VIEW FOR IT MANAGERS AND OWNERS */
        <GarosMobileManagerView
          devices={devices}
          sessions={sessions}
          pxeImages={pxeImages}
          onWakeOnLan={handleWakeOnLan}
          onRebootDevice={handleRebootDevice}
          onOpenConsole={(dev) => setSelectedConsoleDevice(dev)}
          onOpenHealthModal={(dev) => setSelectedHealthDevice(dev)}
          onBroadcastMessage={(msg) => handleBroadcastMessage(msg)}
          onSwitchToDesktopMode={() => setManualOverride('desktop')}
        />
      ) : (
        /* PC WORKSTATION CENTRAL SERVER VIEW */
        <>
          {/* Title & Top Info Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Monitor className="text-kve-accent" size={26} />
                GAROS - Gestão de Estações de Trabalho Diskless
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Gerenciamento de computadores físicos sem disco (Boot PXE / RootFS NFS), Telemetria de Saúde e Controle de Usuários Logados
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
              >
                <Settings size={15} className="text-kve-accent" /> Servidor PXE / TFTP
              </button>

              <div className="hidden sm:flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                <div className={`w-2 h-2 rounded-full ${allCoreHealthy ? 'bg-kve-success animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-slate-400">TFTP/NFS: <strong className={allCoreHealthy ? 'text-white' : 'text-rose-400'}>{allCoreHealthy ? 'ONLINE' : 'FALHA'}</strong></span>
              </div>
            </div>
          </div>

          {/* Header KPI Stats */}
          <GarosHeaderStats
            onlineCount={onlineDevicesCount}
            totalCount={devices.length}
            activeImagesCount={activeImagesCount}
            wolCount={150}
            throughputGb={1.2}
          />

          {/* Main Grid: Terminais Table (Left/Center) & PXE Repo + Traffic (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: Terminal Table & User Sessions */}
            <div className="xl:col-span-7 space-y-6">
              <GarosTerminalTable
                devices={devices}
                pxeImages={pxeImages}
                onImageChange={handleDeviceImageChange}
                onWakeOnLan={handleWakeOnLan}
                onOpenConsole={(dev) => setSelectedConsoleDevice(dev)}
                onOpenHealthModal={(dev) => setSelectedHealthDevice(dev)}
              />

              <GarosSessionManager
                sessions={sessions}
                onKillSession={handleKillSession}
                onBroadcastMessage={handleBroadcastMessage}
              />
            </div>

            {/* Right Column: PXE Images Repository & Network Traffic Chart */}
            <div className="xl:col-span-5 space-y-6">
              <GarosCoreServices />
              <GarosPxeRepo
                pxeImages={pxeImages}
                onCreateImage={handleCreatePXEImage}
                networkTrafficData={networkTrafficData}
              />
            </div>
          </div>
        </>
      )}

      {/* Console VNC Modal */}
      <GarosTerminalConsoleModal
        device={selectedConsoleDevice}
        onClose={() => setSelectedConsoleDevice(null)}
        onReboot={handleRebootDevice}
      />

      {/* Health Telemetry Modal */}
      <GarosTerminalHealthModal
        device={selectedHealthDevice}
        onClose={() => setSelectedHealthDevice(null)}
        onReboot={handleRebootDevice}
      />

      {/* PXE Configuration Modal */}
      <GarosPxeConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </motion.div>
  );
};

export default ThinkServerView;
