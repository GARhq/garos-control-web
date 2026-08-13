import { create } from 'zustand';
import { ToastNotification, User, NetbootDevice } from '../types';

export type UserRole = 'admin' | 'operator' | 'user';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  module: string;
  action: string;
  payload: string;
  result: 'success' | 'danger' | 'warning' | 'info';
}

export interface FirewallRule {
  id: string;
  chain: 'input' | 'output' | 'forward';
  proto: 'tcp' | 'udp' | 'icmp';
  port: string;
  sourceIp: string;
  action: 'accept' | 'drop' | 'reject';
  comment: string;
  addedAt: string;
}

export interface ActiveConnection {
  id: string;
  protocol: 'TCP' | 'UDP';
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  state: 'ESTABLISHED' | 'SYN_SENT' | 'LISTEN' | 'TIME_WAIT';
  bytesSent: string;
  bytesRecv: string;
  process: string;
}

export interface BtrfsDrive {
  id: string;
  model: string;
  type: 'NVMe' | 'SAS HDD' | 'SATA SSD';
  size: string;
  tempC: number;
  readSpeed: string;
  writeSpeed: string;
  smartStatus: 'OK' | 'WARN' | 'FAIL';
}

export interface BtrfsSnapshot {
  id: string;
  name: string;
  subvolume: string;
  timestamp: string;
  sizeMb: number;
  daysAgo: number;
}

export interface SystemServiceItem {
  name: string;
  status: 'active' | 'inactive' | 'failed' | 'activating';
  uptime: string;
  cpu: number;
  memoryMb: number;
  restartCount60s: number;
  needsAttention?: boolean;
}

export interface SystemLogLine {
  id: number;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
}

interface GarosState {
  // Current user & role
  currentUser: string;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Global Toasts
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
  removeToast: (id: string) => void;

  // Panic Mode & Cooldown
  panicModeActive: boolean;
  panicCooldown: boolean;
  triggerPanicMode: (confirmPhrase: string) => boolean;
  deactivatePanicMode: () => void;

  // Global Telemetry Live Feed
  isLiveFeedActive: boolean;
  lastUpdateTimestamp: string;
  toggleLiveFeed: () => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Nodes / Thin Clients
  nodes: NetbootDevice[];
  selectedNodeMacs: string[];
  drawerNodeMac: string | null;
  nodeFilters: { search: string; status: string; os: string };
  toggleSelectNode: (mac: string) => void;
  selectAllNodes: () => void;
  clearSelectedNodes: () => void;
  setDrawerNodeMac: (mac: string | null) => void;
  setNodeFilters: (filters: Partial<{ search: string; status: string; os: string }>) => void;
  performBulkNodeAction: (action: 'wol' | 'shutdown' | 'maintenance') => void;

  // Users & Quotas
  usersList: (User & { softDeleted?: boolean; deletedAt?: string })[];
  addUser: (newUser: Omit<User, 'id'>) => void;
  updateUserQuota: (userId: string, newQuotaGb: number) => void;
  toggleUserStatus: (userId: string) => void;
  softDeleteUser: (userId: string) => void;
  restoreUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: 'admin' | 'operator' | 'user') => void;

  // Firewall & Gateway
  firewallRules: FirewallRule[];
  activeConnections: ActiveConnection[];
  isConnectionsFrozen: boolean;
  addFirewallRule: (rule: Omit<FirewallRule, 'id' | 'addedAt'>) => { success: boolean; error?: string };
  removeFirewallRule: (id: string) => void;
  toggleFreezeConnections: () => void;

  // Storage / BTRFS
  btrfsPoolUsagePct: number;
  isScrubRunning: boolean;
  scrubProgressPct: number;
  scrubEta: string;
  drives: BtrfsDrive[];
  snapshots: BtrfsSnapshot[];
  startBtrfsScrub: () => void;
  rollbackSnapshot: (snapId: string) => void;
  createSnapshot: (name: string, subvolume: string) => void;

  // Services
  services: SystemServiceItem[];
  toggleServiceStatus: (serviceName: string) => void;
  restartService: (serviceName: string) => void;
  clearDiagnosticModal: (serviceName: string) => void;
  diagnosticService: SystemServiceItem | null;

  // System Logs
  systemLogs: SystemLogLine[];
  logFilters: { severity: string; text: string; service: string };
  followTail: boolean;
  setLogFilters: (filters: Partial<{ severity: string; text: string; service: string }>) => void;
  setFollowTail: (follow: boolean) => void;
}

const initialNodes: NetbootDevice[] = [
  { mac: '00:1A:2B:3C:4D:01', ip: '192.168.1.101', hostname: 'thin-client-01', assignedImageId: 'img-01', status: 'Online', ramGb: 8, cpuCores: 4, currentUser: 'aguiarrocha', currentUserRole: 'Admin', loginTime: 'Hoje, 08:00', health: 'Excellent', cpuTempC: 38, cpuUsagePct: 15, memUsagePct: 42, fanSpeedRpm: 1700, pingMs: 0.2, networkLink: '2.5 Gbps RJ45', nfsLatencyMs: 0.1, hardwareModel: 'Dell OptiPlex 7090 Micro - Intel i5', uptime: '12d 4h' },
  { mac: '00:1A:2B:3C:4D:02', ip: '192.168.1.102', hostname: 'thin-client-02', assignedImageId: 'img-01', status: 'Online', ramGb: 8, cpuCores: 4, currentUser: 'carlos.silva', currentUserRole: 'Operator', loginTime: 'Hoje, 08:30', health: 'Good', cpuTempC: 42, cpuUsagePct: 28, memUsagePct: 54, fanSpeedRpm: 1850, pingMs: 0.4, networkLink: '1 Gbps RJ45', nfsLatencyMs: 0.2, hardwareModel: 'HP EliteDesk 800 G6 - Intel i5', uptime: '8d 11h' },
  { mac: '00:1A:2B:3C:4D:03', ip: '192.168.1.103', hostname: 'lab-pc-01', assignedImageId: 'img-01', status: 'Booting', ramGb: 16, cpuCores: 8, currentUser: 'Nenhum', currentUserRole: 'N/A', loginTime: 'N/A', health: 'Good', cpuTempC: 50, cpuUsagePct: 75, memUsagePct: 30, fanSpeedRpm: 2100, pingMs: 1.5, networkLink: '1 Gbps RJ45', nfsLatencyMs: 0.4, hardwareModel: 'Lenovo ThinkCentre M70q - Intel i7', uptime: '2m 10s (Boot PXE)' },
  { mac: '00:1A:2B:3C:4D:04', ip: '192.168.1.104', hostname: 'lab-pc-02', assignedImageId: 'img-02', status: 'Offline', ramGb: 8, cpuCores: 4, currentUser: 'Nenhum', currentUserRole: 'N/A', loginTime: 'N/A', health: 'Offline', cpuTempC: 0, cpuUsagePct: 0, memUsagePct: 0, fanSpeedRpm: 0, pingMs: 180, networkLink: '1 Gbps RJ45', nfsLatencyMs: 0, hardwareModel: 'Positivo Master C630 - Intel i3', uptime: '0m' },
  { mac: '00:1A:2B:3C:4D:05', ip: '192.168.1.105', hostname: 'gate-term-03', assignedImageId: 'img-01', status: 'Online', ramGb: 4, cpuCores: 2, currentUser: 'mariana.lima', currentUserRole: 'User', loginTime: 'Ontem, 16:20', health: 'Warning', cpuTempC: 68, cpuUsagePct: 82, memUsagePct: 88, fanSpeedRpm: 2800, pingMs: 0.8, networkLink: '10 Gbps SFP+', nfsLatencyMs: 0.18, hardwareModel: 'Dell OptiPlex 3080 Micro - Intel i5', uptime: '1d 08h' },
  { mac: '00:1A:2B:3C:4D:06', ip: '192.168.1.106', hostname: 'term-finance-01', assignedImageId: 'img-01', status: 'Online', ramGb: 8, cpuCores: 4, currentUser: 'fernanda.costa', currentUserRole: 'User', loginTime: 'Hoje, 09:12', health: 'Excellent', cpuTempC: 36, cpuUsagePct: 12, memUsagePct: 38, fanSpeedRpm: 1600, pingMs: 0.3, networkLink: '1 Gbps RJ45', nfsLatencyMs: 0.12, hardwareModel: 'Dell OptiPlex 3080 Micro', uptime: '3d 02h' },
  { mac: '00:1A:2B:3C:4D:07', ip: '192.168.1.107', hostname: 'term-design-01', assignedImageId: 'img-01', status: 'Online', ramGb: 32, cpuCores: 16, currentUser: 'lucas.mendes', currentUserRole: 'User', loginTime: 'Hoje, 07:45', health: 'Good', cpuTempC: 58, cpuUsagePct: 64, memUsagePct: 72, fanSpeedRpm: 2300, pingMs: 0.5, networkLink: '10 Gbps SFP+', nfsLatencyMs: 0.08, hardwareModel: 'Workstation Ryzen 9 5900X', uptime: '5d 14h' },
  { mac: '00:1A:2B:3C:4D:08', ip: '192.168.1.108', hostname: 'lab-pc-03', assignedImageId: 'img-02', status: 'Offline', ramGb: 8, cpuCores: 4, currentUser: 'Nenhum', currentUserRole: 'N/A', loginTime: 'N/A', health: 'Offline', cpuTempC: 0, cpuUsagePct: 0, memUsagePct: 0, fanSpeedRpm: 0, pingMs: 250, networkLink: '1 Gbps RJ45', nfsLatencyMs: 0, hardwareModel: 'Lenovo ThinkCentre M70q', uptime: '0m' },
];

const initialUsers: (User & { softDeleted?: boolean; deletedAt?: string })[] = [
  { id: 'usr-1', username: 'aguiarrocha', email: 'aguiarrocha36@gmail.com', role: 'admin', status: 'active', quotaUsed: 85, quotaLimit: 250, lastActivity: 'Agora mesmo' },
  { id: 'usr-2', username: 'carlos.silva', email: 'carlos.silva@garos.internal', role: 'operator', status: 'active', quotaUsed: 210, quotaLimit: 250, lastActivity: 'Há 5m' },
  { id: 'usr-3', username: 'mariana.lima', email: 'mariana.lima@garos.internal', role: 'user', status: 'active', quotaUsed: 490, quotaLimit: 500, lastActivity: 'Há 12m' },
  { id: 'usr-4', username: 'roberto.alves', email: 'roberto.alves@garos.internal', role: 'user', status: 'blocked', quotaUsed: 98, quotaLimit: 100, lastActivity: 'Há 2d' },
  { id: 'usr-5', username: 'fernanda.costa', email: 'fernanda.costa@garos.internal', role: 'user', status: 'active', quotaUsed: 45, quotaLimit: 100, lastActivity: 'Hoje, 09:12' },
  { id: 'usr-6', username: 'lucas.mendes', email: 'lucas.mendes@garos.internal', role: 'user', status: 'active', quotaUsed: 920, quotaLimit: 1000, lastActivity: 'Hoje, 07:45' },
  { id: 'usr-7', username: 'juliana.paes', email: 'juliana.paes@garos.internal', role: 'operator', status: 'active', quotaUsed: 120, quotaLimit: 500, lastActivity: 'Ontem, 18:30' },
  { id: 'usr-8', username: 'bruno.souza', email: 'bruno.souza@garos.internal', role: 'user', status: 'active', quotaUsed: 88, quotaLimit: 100, lastActivity: 'Há 1h' },
];

const initialRules: FirewallRule[] = [
  { id: 'fw-1', chain: 'input', proto: 'tcp', port: '22', sourceIp: '192.168.1.0/24', action: 'accept', comment: 'Acesso SSH Administração local', addedAt: '2026-08-01 10:00' },
  { id: 'fw-2', chain: 'input', proto: 'udp', port: '67,68,69', sourceIp: '0.0.0.0/0', action: 'accept', comment: 'Portas DHCP / TFTP Boot PXE', addedAt: '2026-08-01 10:05' },
  { id: 'fw-3', chain: 'input', proto: 'tcp', port: '2049', sourceIp: '192.168.1.0/24', action: 'accept', comment: 'Serviço NFS RootFS compartilhamento', addedAt: '2026-08-01 10:10' },
  { id: 'fw-4', chain: 'input', proto: 'udp', port: '9', sourceIp: '192.168.1.255', action: 'accept', comment: 'Broadcasting Wake-on-LAN Proxy', addedAt: '2026-08-01 10:12' },
  { id: 'fw-5', chain: 'forward', proto: 'tcp', port: '80,443', sourceIp: '192.168.1.0/24', action: 'accept', comment: 'Navegação Web Estações Diskless', addedAt: '2026-08-02 14:20' },
];

const initialConnections: ActiveConnection[] = [
  { id: 'conn-1', protocol: 'TCP', srcIp: '192.168.1.101', srcPort: 54320, dstIp: '192.168.1.10', dstPort: 2049, state: 'ESTABLISHED', bytesSent: '1.2 GB', bytesRecv: '4.8 GB', process: 'nfs-kernel-server' },
  { id: 'conn-2', protocol: 'UDP', srcIp: '192.168.1.103', srcPort: 68, dstIp: '192.168.1.10', dstPort: 67, state: 'ESTABLISHED', bytesSent: '320 KB', bytesRecv: '120 KB', process: 'dnsmasq-dhcp' },
  { id: 'conn-3', protocol: 'TCP', srcIp: '192.168.1.105', srcPort: 48921, dstIp: '192.168.1.10', dstPort: 3000, state: 'ESTABLISHED', bytesSent: '45 MB', bytesRecv: '12 MB', process: 'garos-control-plane' },
  { id: 'conn-4', protocol: 'TCP', srcIp: '192.168.1.102', srcPort: 38210, dstIp: '192.168.1.10', dstPort: 22, state: 'ESTABLISHED', bytesSent: '1.8 MB', bytesRecv: '8.4 MB', process: 'sshd' },
  { id: 'conn-5', protocol: 'UDP', srcIp: '192.168.1.107', srcPort: 51204, dstIp: '192.168.1.10', dstPort: 69, state: 'ESTABLISHED', bytesSent: '420 MB', bytesRecv: '12 MB', process: 'in.tftpd' },
];

const initialDrives: BtrfsDrive[] = [
  { id: 'drv-1', model: 'Samsung 980 PRO 2TB NVMe SSD', type: 'NVMe', size: '2.0 TB', tempC: 38, readSpeed: '6,800 MB/s', writeSpeed: '4,900 MB/s', smartStatus: 'OK' },
  { id: 'drv-2', model: 'Kioxia CD6-R 3.84TB Enterprise NVMe', type: 'NVMe', size: '3.84 TB', tempC: 41, readSpeed: '5,500 MB/s', writeSpeed: '3,200 MB/s', smartStatus: 'OK' },
  { id: 'drv-3', model: 'Seagate Exos X18 16TB SAS HDD', type: 'SAS HDD', size: '16.0 TB', tempC: 36, readSpeed: '260 MB/s', writeSpeed: '240 MB/s', smartStatus: 'OK' },
  { id: 'drv-4', model: 'Seagate Exos X18 16TB SAS HDD', type: 'SAS HDD', size: '16.0 TB', tempC: 48, readSpeed: '240 MB/s', writeSpeed: '220 MB/s', smartStatus: 'WARN' },
];

const initialSnapshots: BtrfsSnapshot[] = [
  { id: 'snap-1', name: 'snapshot-2026-08-12-daily', subvolume: '/export/home', timestamp: '2026-08-12 00:00', sizeMb: 1420, daysAgo: 1 },
  { id: 'snap-2', name: 'snapshot-2026-08-10-pre-update', subvolume: '/export/nix-store', timestamp: '2026-08-10 14:30', sizeMb: 480, daysAgo: 3 },
  { id: 'snap-3', name: 'snapshot-2026-08-05-weekly', subvolume: '/export/home', timestamp: '2026-08-05 00:00', sizeMb: 2850, daysAgo: 8 },
  { id: 'snap-4', name: 'snapshot-2026-07-28-baseline', subvolume: '/export/home', timestamp: '2026-07-28 12:00', sizeMb: 5120, daysAgo: 16 },
];

const initialServices: SystemServiceItem[] = [
  { name: 'nfs-kernel-server', status: 'active', uptime: '12d 04h', cpu: 1.8, memoryMb: 512, restartCount60s: 0 },
  { name: 'dnsmasq', status: 'active', uptime: '12d 04h', cpu: 0.1, memoryMb: 18, restartCount60s: 0 },
  { name: 'tftp-server', status: 'active', uptime: '12d 04h', cpu: 0.2, memoryMb: 32, restartCount60s: 0 },
  { name: 'garos-wol-proxy', status: 'active', uptime: '12d 04h', cpu: 0.05, memoryMb: 14, restartCount60s: 0 },
  { name: 'nftables-firewall', status: 'active', uptime: '45d 01h', cpu: 0.02, memoryMb: 8, restartCount60s: 0 },
  { name: 'btrfs-scrub-daemon', status: 'inactive', uptime: '0s', cpu: 0, memoryMb: 0, restartCount60s: 0 },
  { name: 'sshd', status: 'active', uptime: '120d', cpu: 0.05, memoryMb: 12, restartCount60s: 0 },
  { name: 'garos-telemetry-agent', status: 'failed', uptime: '0s', cpu: 0, memoryMb: 0, restartCount60s: 2 },
];

const generateInitialLogs = (): SystemLogLine[] => {
  const lines: SystemLogLine[] = [];
  const servicesList = ['nfs-kernel-server', 'dnsmasq', 'tftp-server', 'garos-wol-proxy', 'nftables-firewall', 'sshd'];
  const severities: ('INFO' | 'WARN' | 'ERROR' | 'DEBUG')[] = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR', 'DEBUG'];

  for (let i = 1; i <= 150; i++) {
    const time = new Date(Date.now() - (150 - i) * 10000).toLocaleTimeString();
    const service = servicesList[i % servicesList.length];
    const sev = severities[i % severities.length];
    lines.push({
      id: i,
      timestamp: time,
      severity: sev,
      service,
      message: sev === 'INFO' 
        ? `Operação de rotina executada em ${service} com sucesso [code 0x${(i * 13).toString(16)}].`
        : sev === 'WARN'
        ? `Aviso de latência excedida em ${service} (throughput elevado no segmento).`
        : sev === 'ERROR'
        ? `Falha de autenticação/handshake temporária registrada em ${service}.`
        : `Trace interno de execução e alocação de buffer do daemon ${service}.`
    });
  }
  return lines;
};

export const useGarosStore = create<GarosState>((set, get) => ({
  currentUser: 'aguiarrocha',
  userRole: 'admin',
  setUserRole: (role) => set({ userRole: role }),

  toasts: [],
  addToast: (title, message, type) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  panicModeActive: false,
  panicCooldown: false,
  triggerPanicMode: (confirmPhrase) => {
    if (get().panicCooldown) return false;
    if (confirmPhrase.trim().toUpperCase() !== 'PANIC') return false;

    set({ panicModeActive: true, panicCooldown: true });
    get().addToast(
      'MODO DE PÂNICO ATIVADO',
      'Bloqueio geral do firewall aplicado e sessões isoladas emergencialmente!',
      'danger'
    );
    get().addAuditLog({
      user: get().currentUser,
      role: get().userRole,
      module: 'Global Panic',
      action: 'TRIGGER_PANIC',
      payload: 'Emergency Drop All rules applied',
      result: 'danger',
    });

    setTimeout(() => {
      set({ panicCooldown: false });
    }, 5000);

    return true;
  },
  deactivatePanicMode: () => {
    set({ panicModeActive: false });
    get().addToast('Pânico Normalizado', 'Regras de firewall restauradas para a operação padrão.', 'info');
    get().addAuditLog({
      user: get().currentUser,
      role: get().userRole,
      module: 'Global Panic',
      action: 'DEACTIVATE_PANIC',
      payload: 'Restored standard network operations',
      result: 'success',
    });
  },

  isLiveFeedActive: true,
  lastUpdateTimestamp: new Date().toLocaleTimeString(),
  toggleLiveFeed: () => set((state) => ({ isLiveFeedActive: !state.isLiveFeedActive })),

  auditLogs: [
    { id: 'aud-1', timestamp: '2026-08-13 06:12:00', user: 'aguiarrocha', role: 'admin', module: 'System', action: 'BOOT_SYSTEM', payload: 'GAROS Kernel initialized', result: 'success' },
    { id: 'aud-2', timestamp: '2026-08-13 06:20:15', user: 'carlos.silva', role: 'operator', module: 'Nodes', action: 'WOL_TRANSMIT', payload: 'Target thin-client-01 (00:1A:2B:3C:4D:01)', result: 'info' },
  ],
  addAuditLog: (entry) => {
    const id = `aud-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    set((state) => ({
      auditLogs: [{ id, timestamp, ...entry }, ...state.auditLogs.slice(0, 99)],
    }));
  },

  nodes: initialNodes,
  selectedNodeMacs: [],
  drawerNodeMac: null,
  nodeFilters: { search: '', status: 'all', os: 'all' },
  toggleSelectNode: (mac) =>
    set((state) => ({
      selectedNodeMacs: state.selectedNodeMacs.includes(mac)
        ? state.selectedNodeMacs.filter((m) => m !== mac)
        : [...state.selectedNodeMacs, mac],
    })),
  selectAllNodes: () => set((state) => ({ selectedNodeMacs: state.nodes.map((n) => n.mac) })),
  clearSelectedNodes: () => set({ selectedNodeMacs: [] }),
  setDrawerNodeMac: (mac) => set({ drawerNodeMac: mac }),
  setNodeFilters: (filters) =>
    set((state) => ({ nodeFilters: { ...state.nodeFilters, ...filters } })),
  performBulkNodeAction: (action) => {
    const { selectedNodeMacs, currentUser, userRole, addToast, addAuditLog } = get();
    if (selectedNodeMacs.length === 0) return;

    if (userRole === 'user') {
      addToast('Acesso Negado', 'Seu papel (User) não possui permissão para ações em lote.', 'danger');
      return;
    }

    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (selectedNodeMacs.includes(n.mac)) {
          if (action === 'wol') {
            return { ...n, status: 'Booting', health: 'Good', uptime: '1m (Booting)' };
          } else if (action === 'shutdown') {
            return { ...n, status: 'Offline', health: 'Offline', uptime: '0m' };
          } else if (action === 'maintenance') {
            return { ...n, status: 'Online', health: 'Warning', currentUser: 'Manutenção' };
          }
        }
        return n;
      }),
      selectedNodeMacs: [],
    }));

    const labels = { wol: 'Wake-on-LAN', shutdown: 'Desligamento', maintenance: 'Modo Manutenção' };
    addToast(
      `Ação em Lote (${labels[action]})`,
      `Comando enviado com sucesso para ${selectedNodeMacs.length} estação(ões).`,
      'success'
    );
    addAuditLog({
      user: currentUser,
      role: userRole,
      module: 'Nodes Bulk',
      action: `BULK_${action.toUpperCase()}`,
      payload: `Target MACs: ${selectedNodeMacs.join(', ')}`,
      result: 'success',
    });
  },

  usersList: initialUsers,
  addUser: (newUser) => {
    const id = `usr-${Date.now()}`;
    set((state) => ({
      usersList: [{ id, ...newUser, quotaUsed: 0, lastActivity: 'Recém criado' }, ...state.usersList],
    }));
    get().addToast('Usuário Adicionado', `O usuário ${newUser.username} foi cadastrado com sucesso.`, 'success');
    get().addAuditLog({
      user: get().currentUser,
      role: get().userRole,
      module: 'Users',
      action: 'ADD_USER',
      payload: `Created ${newUser.username} (${newUser.email})`,
      result: 'success',
    });
  },
  updateUserQuota: (userId, newQuotaGb) => {
    set((state) => ({
      usersList: state.usersList.map((u) => (u.id === userId ? { ...u, quotaLimit: newQuotaGb } : u)),
    }));
    get().addToast('Cota Atualizada', `Cota de armazenamento alterada para ${newQuotaGb} GB.`, 'success');
    get().addAuditLog({
      user: get().currentUser,
      role: get().userRole,
      module: 'Users Quota',
      action: 'UPDATE_QUOTA',
      payload: `User ID: ${userId} -> New Limit: ${newQuotaGb}GB`,
      result: 'success',
    });
  },
  toggleUserStatus: (userId) => {
    let newStatus: 'active' | 'blocked' = 'active';
    let targetUsername = '';
    set((state) => ({
      usersList: state.usersList.map((u) => {
        if (u.id === userId) {
          newStatus = u.status === 'active' ? 'blocked' : 'active';
          targetUsername = u.username;
          return { ...u, status: newStatus };
        }
        return u;
      }),
    }));
    get().addToast(
      `Status Alterado: ${targetUsername}`,
      `O usuário agora está ${newStatus === 'active' ? 'ATIVO' : 'BLOQUEADO'}.`,
      newStatus === 'active' ? 'success' : 'warning'
    );
    get().addAuditLog({
      user: get().currentUser,
      role: get().userRole,
      module: 'Users',
      action: 'TOGGLE_STATUS',
      payload: `User ${targetUsername} set to ${newStatus}`,
      result: 'info',
    });
  },
  softDeleteUser: (userId) => {
    const nowStr = new Date().toLocaleDateString();
    let targetUsername = '';
    set((state) => ({
      usersList: state.usersList.map((u) => {
        if (u.id === userId) {
          targetUsername = u.username;
          return { ...u, softDeleted: true, deletedAt: nowStr };
        }
        return u;
      }),
    }));
    get().addToast('Usuário Removido (Soft Delete)', `${targetUsername} foi marcado para exclusão (Retenção 30 dias).`, 'warning');
    get().addAuditLog({
      user: get().currentUser,
      role: get().userRole,
      module: 'Users',
      action: 'SOFT_DELETE_USER',
      payload: `Soft delete user ${targetUsername} (Retention 30 days)`,
      result: 'warning',
    });
  },
  restoreUser: (userId) => {
    let targetUsername = '';
    set((state) => ({
      usersList: state.usersList.map((u) => {
        if (u.id === userId) {
          targetUsername = u.username;
          return { ...u, softDeleted: false, deletedAt: undefined };
        }
        return u;
      }),
    }));
    get().addToast('Usuário Restaurado', `${targetUsername} foi restaurado com sucesso.`, 'success');
  },
  updateUserRole: (userId, newRole) => {
    set((state) => ({
      usersList: state.usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    }));
    get().addToast('Papel Atualizado', `Papel do usuário alterado para ${newRole.toUpperCase()}.`, 'info');
  },

  firewallRules: initialRules,
  activeConnections: initialConnections,
  isConnectionsFrozen: false,
  addFirewallRule: (rule) => {
    const existing = get().firewallRules.find(
      (r) => r.proto === rule.proto && r.port === rule.port && r.chain === rule.chain
    );
    if (existing) {
      return { success: false, error: `Conflito de regra: Porta ${rule.port}/${rule.proto.toUpperCase()} já configurada em ${rule.chain}.` };
    }

    const id = `fw-${Date.now()}`;
    const addedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    set((state) => ({
      firewallRules: [...state.firewallRules, { id, addedAt, ...rule }],
    }));
    get().addToast('Regra Adicionada', `Regra nftables para porta ${rule.port}/${rule.proto.toUpperCase()} criada.`, 'success');
    get().addAuditLog({
      user: get().currentUser,
      role: get().userRole,
      module: 'Gateway Firewall',
      action: 'ADD_RULE',
      payload: `nft add rule inet filter ${rule.chain} ${rule.proto} dport ${rule.port} ${rule.action}`,
      result: 'success',
    });
    return { success: true };
  },
  removeFirewallRule: (id) => {
    const rule = get().firewallRules.find((r) => r.id === id);
    set((state) => ({
      firewallRules: state.firewallRules.filter((r) => r.id !== id),
    }));
    get().addToast('Regra Removida', 'A regra do firewall foi excluída.', 'info');
    if (rule) {
      get().addAuditLog({
        user: get().currentUser,
        role: get().userRole,
        module: 'Gateway Firewall',
        action: 'DROP_RULE',
        payload: `Removed rule ID ${id} (${rule.port}/${rule.proto})`,
        result: 'warning',
      });
    }
  },
  toggleFreezeConnections: () => set((state) => ({ isConnectionsFrozen: !state.isConnectionsFrozen })),

  btrfsPoolUsagePct: 62,
  isScrubRunning: false,
  scrubProgressPct: 0,
  scrubEta: 'N/A',
  drives: initialDrives,
  snapshots: initialSnapshots,
  startBtrfsScrub: () => {
    if (get().isScrubRunning) return;
    set({ isScrubRunning: true, scrubProgressPct: 1, scrubEta: '04m 12s' });
    get().addToast('Scrub BTRFS Iniciado', 'Iniciada verificação de integridade dos blocos de dados.', 'info');

    const interval = setInterval(() => {
      const current = get().scrubProgressPct;
      if (current >= 100) {
        clearInterval(interval);
        set({ isScrubRunning: false, scrubProgressPct: 100, scrubEta: 'Concluído (0 erros)' });
        get().addToast('Scrub BTRFS Concluído', 'Verificação finalizada. Nenhum erro de checksum encontrado!', 'success');
      } else {
        const next = current + Math.floor(Math.random() * 12) + 5;
        const etaSeconds = Math.max(0, Math.floor((100 - next) * 2.5));
        set({
          scrubProgressPct: Math.min(100, next),
          scrubEta: `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s`,
        });
      }
    }, 1500);
  },
  rollbackSnapshot: (snapId) => {
    const snap = get().snapshots.find((s) => s.id === snapId);
    if (!snap) return;
    get().addToast('Rollback BTRFS Executado', `Subvolume ${snap.subvolume} restaurado para ponto ${snap.name}.`, 'warning');
    get().addAuditLog({
      user: get().currentUser,
      role: get().userRole,
      module: 'Storage BTRFS',
      action: 'SNAPSHOT_ROLLBACK',
      payload: `Restored subvolume ${snap.subvolume} to ${snap.name}`,
      result: 'warning',
    });
  },
  createSnapshot: (name, subvolume) => {
    const id = `snap-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    set((state) => ({
      snapshots: [{ id, name, subvolume, timestamp, sizeMb: 240, daysAgo: 0 }, ...state.snapshots],
    }));
    get().addToast('Snapshot Criado', `Snapshot ${name} gravado no pool BTRFS.`, 'success');
  },

  services: initialServices,
  diagnosticService: null,
  toggleServiceStatus: (serviceName) => {
    set((state) => ({
      services: state.services.map((s) => {
        if (s.name === serviceName) {
          const nextStatus = s.status === 'active' ? 'inactive' : 'active';
          return { ...s, status: nextStatus };
        }
        return s;
      }),
    }));
  },
  restartService: (serviceName) => {
    const { currentUser, userRole, addToast, addAuditLog } = get();
    let triggerDiag = false;
    let targetSrv: SystemServiceItem | null = null;

    set((state) => ({
      services: state.services.map((s) => {
        if (s.name === serviceName) {
          const newCount = s.restartCount60s + 1;
          const needsAttention = newCount >= 3;
          targetSrv = { ...s, restartCount60s: newCount, needsAttention, status: needsAttention ? 'failed' : 'active', uptime: '1s' };
          if (needsAttention) triggerDiag = true;
          return targetSrv;
        }
        return s;
      }),
    }));

    if (triggerDiag && targetSrv) {
      set({ diagnosticService: targetSrv });
      addToast('Atenção: Falhas Repetidas', `O serviço ${serviceName} falhou 3x consecutivas. Modal de diagnóstico aberto.`, 'danger');
      addAuditLog({
        user: currentUser,
        role: userRole,
        module: 'Services Daemon',
        action: 'SERVICE_RESTART_FAILED_EXCEEDED',
        payload: `Service ${serviceName} restart failed 3 times in 60s`,
        result: 'danger',
      });
    } else {
      addToast('Serviço Reiniciado', `Sinal systemctl restart transmitido para ${serviceName}.`, 'success');
      addAuditLog({
        user: currentUser,
        role: userRole,
        module: 'Services Daemon',
        action: 'SERVICE_RESTART',
        payload: `Restarted ${serviceName}`,
        result: 'success',
      });
    }
  },
  clearDiagnosticModal: () => set({ diagnosticService: null }),

  systemLogs: generateInitialLogs(),
  logFilters: { severity: 'ALL', text: '', service: 'ALL' },
  followTail: true,
  setLogFilters: (filters) => set((state) => ({ logFilters: { ...state.logFilters, ...filters } })),
  setFollowTail: (follow) => set({ followTail: follow }),
}));
