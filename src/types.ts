export type ViewType = 
  | 'dashboard' 
  | 'users' 
  | 'quotas' 
  | 'nodes' 
  | 'publish' 
  | 'services' 
  | 'storage' 
  | 'monitoring' 
  | 'gateway' 
  | 'logs' 
  | 'settings'
  | 'server'
  | 'folder'
  | 'image'
  | 'station'
  | 'api-hub'
  | 'node-server';

export interface ResourceTreeNode {
  id: string;
  type: 'server' | 'folder' | 'image' | 'station';
  label: string;
  status?: 'online' | 'offline' | 'running' | 'stopped';
  children?: ResourceTreeNode[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'user';
  status: 'active' | 'blocked';
  quotaUsed: number;
  quotaLimit: number;
  lastActivity: string;
}

export interface Node {
  id: string;
  hostname: string;
  mac: string;
  ip: string;
  status: 'online' | 'offline';
  generation: string;
  uptime: string;
  authorized: boolean;
}

export interface Service {
  name: string;
  status: 'running' | 'stopped' | 'failed';
  uptime: string;
  cpu: number;
  memory: number;
}

export interface NetbootDevice {
  mac: string;
  ip: string;
  hostname: string;
  assignedImageId: string;
  status: 'Online' | 'Offline' | 'Booting' | 'Warning';
  ramGb: number;
  cpuCores: number;
  currentUser: string;
  currentUserRole?: string;
  loginTime?: string;
  health: 'Excellent' | 'Good' | 'Warning' | 'Offline';
  cpuTempC: number;
  cpuUsagePct: number;
  memUsagePct: number;
  fanSpeedRpm: number;
  pingMs: number;
  networkLink: string;
  nfsLatencyMs: number;
  hardwareModel: string;
  uptime: string;
}

export interface PXEImageDetail {
  id: string;
  name: string;
  kernel: string;
  args: string;
  sizeMb: number;
  status: 'Active' | 'Compiling' | 'Idle' | 'Error';
  lastUpdated: string;
}

export interface ActiveSession {
  id: string;
  username: string;
  deviceIp: string;
  terminalServer: string;
  idleTime: string;
  cpuPct: number;
  memPct: number;
  status: 'Active' | 'Idle' | 'Locked';
}

export interface GarosServerStatus {
  serverName: string;
  serverIp: string;
  tftpStatus: 'Online' | 'Offline';
  nfsStatus: 'Online' | 'Offline';
  dhcpStatus: 'Online' | 'Offline';
  wolProxyStatus: 'Online' | 'Offline';
  activeDevices: number;
  totalDevices: number;
  activeSessions: number;
  activeImages: number;
  throughputGb: number;
  cpuLoadPct: number;
  memoryUsagePct: number;
  nfsStoreUsagePct: number;
}

export interface GarosServerConfig {
  serverHostname: string;
  serverIp: string;
  subnetRange: string;
  tftpRoot: string;
  nfsExportPath: string;
  defaultPxeImageId: string;
  wolBroadcastIp: string;
  autoPowerOnSchedule: boolean;
  maxSessionsPerStation: number;
}

export interface AuditLog {
  id: number;
  time: string;
  level: 'info' | 'warning' | 'danger' | 'success';
  source: string;
  message: string;
  user: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'danger';
}

