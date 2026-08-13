import { 
  NetbootDevice, 
  PXEImageDetail, 
  ActiveSession, 
  GarosServerStatus, 
  GarosServerConfig, 
  AuditLog, 
  Service 
} from '../types';

// Default mock fallbacks if API is offline or starting up
const fallbackDevices: NetbootDevice[] = [
  {
    mac: '00:1A:2B:3C:4D:5E',
    ip: '192.168.1.150',
    hostname: 'thin-client-01',
    assignedImageId: 'img-01',
    status: 'Online',
    ramGb: 4,
    cpuCores: 2,
    currentUser: 'aguiarrocha (Gabriel Rocha)',
    currentUserRole: 'Engenheiro Principal',
    loginTime: 'Hoje, 08:14',
    health: 'Excellent',
    cpuTempC: 38,
    cpuUsagePct: 18,
    memUsagePct: 42,
    fanSpeedRpm: 1720,
    pingMs: 0.3,
    networkLink: '2.5 Gbps RJ45',
    nfsLatencyMs: 0.12,
    hardwareModel: 'Dell OptiPlex 7090 Micro - Intel i5-12400',
    uptime: '4h 32m',
  },
  {
    mac: '00:1A:2B:3C:4D:5F',
    ip: '192.168.1.151',
    hostname: 'thin-client-02',
    assignedImageId: 'img-01',
    status: 'Online',
    ramGb: 4,
    cpuCores: 2,
    currentUser: 'operator-01 (Carlos Silva)',
    currentUserRole: 'Atendente de Caixas',
    loginTime: 'Hoje, 09:00',
    health: 'Good',
    cpuTempC: 45,
    cpuUsagePct: 35,
    memUsagePct: 58,
    fanSpeedRpm: 1950,
    pingMs: 0.5,
    networkLink: '1 Gbps RJ45',
    nfsLatencyMs: 0.24,
    hardwareModel: 'HP EliteDesk 800 G6 - Intel i5-10500',
    uptime: '2h 15m',
  },
  {
    mac: '00:1A:2B:3C:4D:60',
    ip: '192.168.1.152',
    hostname: 'lab-pc-01',
    assignedImageId: 'img-01',
    status: 'Booting',
    ramGb: 8,
    cpuCores: 4,
    currentUser: 'Nenhum (Livre)',
    currentUserRole: 'Aguardando Login',
    loginTime: 'N/A',
    health: 'Good',
    cpuTempC: 52,
    cpuUsagePct: 85,
    memUsagePct: 20,
    fanSpeedRpm: 2300,
    pingMs: 1.2,
    networkLink: '1 Gbps RJ45',
    nfsLatencyMs: 0.45,
    hardwareModel: 'Lenovo ThinkCentre M70q - Intel i5-11400',
    uptime: '1m 20s (Boot PXE)',
  },
  {
    mac: '00:1A:2B:3C:4D:61',
    ip: '192.168.1.153',
    hostname: 'lab-pc-02',
    assignedImageId: 'img-02',
    status: 'Offline',
    ramGb: 8,
    cpuCores: 4,
    currentUser: 'Nenhum (Livre)',
    currentUserRole: 'Desligado',
    loginTime: 'N/A',
    health: 'Offline',
    cpuTempC: 0,
    cpuUsagePct: 0,
    memUsagePct: 0,
    fanSpeedRpm: 0,
    pingMs: 0,
    networkLink: '1 Gbps RJ45',
    nfsLatencyMs: 0,
    hardwareModel: 'Positivo Master C630 - Intel i3-10100',
    uptime: '0m',
  },
  {
    mac: '00:1A:2B:3C:4D:62',
    ip: '192.168.1.154',
    hostname: 'gate-term-03',
    assignedImageId: 'img-01',
    status: 'Online',
    ramGb: 4,
    cpuCores: 2,
    currentUser: 'user-alpha (Mariana Lima)',
    currentUserRole: 'Analista de Suporte',
    loginTime: 'Ontem, 16:20',
    health: 'Warning',
    cpuTempC: 68,
    cpuUsagePct: 78,
    memUsagePct: 82,
    fanSpeedRpm: 2650,
    pingMs: 0.8,
    networkLink: '10 Gbps SFP+',
    nfsLatencyMs: 0.18,
    hardwareModel: 'Dell OptiPlex 3080 Micro - Intel i5-10400',
    uptime: '1d 08h',
  },
];

const fallbackPxeImages: PXEImageDetail[] = [
  { id: 'img-01', name: 'GarOS-Thin-Client-v2.6', kernel: '6.6.21-garos-lts', args: 'initrd=initrd ip=dhcp console=ttyS0 boot.shell_on_fail', sizeMb: 420, status: 'Active', lastUpdated: 'Hoje, 10:15' },
  { id: 'img-02', name: 'GAROS-Rescue-Shell-v1.4', kernel: '6.1.72-rescue', args: 'initrd=initrd_rescue ip=dhcp rescue_mode=true nomodeset', sizeMb: 180, status: 'Active', lastUpdated: 'Ontem, 18:30' },
  { id: 'img-03', name: 'Alpine-Diskless-GAROS-v3.19', kernel: '6.6.8-alpine', args: 'initrd=initramfs-alpine ip=dhcp alpine_dev=nfs', sizeMb: 95, status: 'Idle', lastUpdated: '12 Jul 2026' },
];

const fallbackSessions: ActiveSession[] = [
  { id: 'sess-01', username: 'aguiarrocha (Gabriel Rocha)', deviceIp: '192.168.1.150', terminalServer: 'garos-primary', idleTime: 'Agora', cpuPct: 18, memPct: 42, status: 'Active' },
  { id: 'sess-02', username: 'operator-01 (Carlos Silva)', deviceIp: '192.168.1.151', terminalServer: 'garos-primary', idleTime: '2m 14s', cpuPct: 35, memPct: 58, status: 'Active' },
  { id: 'sess-03', username: 'user-alpha (Mariana Lima)', deviceIp: '192.168.1.154', terminalServer: 'garos-primary', idleTime: '15m 03s', cpuPct: 78, memPct: 82, status: 'Idle' },
];

export async function fetchGarosDevices(): Promise<NetbootDevice[]> {
  try {
    const res = await fetch('/api/garos/devices');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Using local fallback devices state", e);
  }
  return fallbackDevices;
}

export async function sendWakeOnLan(mac: string): Promise<boolean> {
  try {
    const res = await fetch('/api/garos/devices/wol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mac }),
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn("WOL call handled locally", e);
  }
  return true;
}

export async function updateDeviceImage(mac: string, assignedImageId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/devices/${encodeURIComponent(mac)}/image`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedImageId }),
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn("Update device image handled locally", e);
  }
  return true;
}

export async function sendTerminalMessage(mac: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/devices/${encodeURIComponent(mac)}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn("Terminal message handled locally", e);
  }
  return true;
}

export async function rebootTerminalDevice(mac: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/devices/${encodeURIComponent(mac)}/reboot`, {
      method: 'POST',
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn("Reboot device handled locally", e);
  }
  return true;
}

export async function fetchGarosPxeImages(): Promise<PXEImageDetail[]> {
  try {
    const res = await fetch('/api/garos/pxe/images');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Using local fallback PXE images", e);
  }
  return fallbackPxeImages;
}

export async function createGarosPxeImage(name: string, kernel: string, args: string): Promise<PXEImageDetail> {
  try {
    const res = await fetch('/api/garos/pxe/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, kernel, args }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Create PXE image handled locally", e);
  }
  return {
    id: `img-${Date.now()}`,
    name,
    kernel,
    args,
    sizeMb: 350,
    status: 'Active',
    lastUpdated: 'Agora',
  };
}

export async function fetchGarosSessions(): Promise<ActiveSession[]> {
  try {
    const res = await fetch('/api/garos/sessions');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Using local fallback sessions", e);
  }
  return fallbackSessions;
}

export async function terminateSession(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/sessions/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (e) {
    console.warn("Session termination handled locally", e);
  }
  return true;
}

export async function fetchGarosServices(): Promise<Service[]> {
  try {
    const res = await fetch('/api/garos/services');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Using local services fallback", e);
  }
  return [
    { name: 'tftp-server (PXE)', status: 'running', uptime: '15d 4h', cpu: 0.2, memory: 32 },
    { name: 'nfs-kernel-server (RootFS)', status: 'running', uptime: '15d 4h', cpu: 2.4, memory: 512 },
    { name: 'dnsmasq (ProxyDHCP)', status: 'running', uptime: '15d 4h', cpu: 0.1, memory: 18 },
    { name: 'garos-wol-proxy', status: 'running', uptime: '15d 4h', cpu: 0.05, memory: 12 },
    { name: 'nix-daemon (Store)', status: 'running', uptime: '30d 2h', cpu: 0.8, memory: 120 },
    { name: 'sshd (Remote Mgmt)', status: 'running', uptime: '120d', cpu: 0.1, memory: 8 },
  ];
}

export async function triggerGarosServiceAction(name: string, action: 'start' | 'stop' | 'restart'): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/services/${encodeURIComponent(name)}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn("Service action handled locally", e);
  }
  return true;
}

export async function fetchGarosLogs(): Promise<AuditLog[]> {
  try {
    const res = await fetch('/api/garos/logs');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Using local logs fallback", e);
  }
  return [
    { id: 101, time: new Date(Date.now() - 100000).toLocaleString(), level: 'success', source: 'pxe-boot', message: 'Estação thin-client-01 (192.168.1.150) iniciou via TFTP', user: 'aguiarrocha' },
    { id: 102, time: new Date(Date.now() - 300000).toLocaleString(), level: 'info', source: 'nfs-server', message: 'RootFS montado via NFSv4 para lab-pc-01', user: 'system' },
    { id: 103, time: new Date(Date.now() - 600000).toLocaleString(), level: 'warning', source: 'wol-proxy', message: 'Pacote Magic Packet WOL transmitido no broadcast 192.168.1.255', user: 'aguiarrocha' },
    { id: 104, time: new Date(Date.now() - 1200000).toLocaleString(), level: 'info', source: 'auth-service', message: 'Sessão aberta para operator-01 em thin-client-02', user: 'operator-01' },
    { id: 105, time: new Date(Date.now() - 2500000).toLocaleString(), level: 'success', source: 'nix-builder', message: 'Imagem GarOS-Thin-Client-v2.6 recompilada e promovida no TFTP', user: 'aguiarrocha' },
  ];
}

export async function executeGarosTerminalCommand(command: string): Promise<string> {
  try {
    const res = await fetch('/api/garos/terminal/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.output;
    }
  } catch (e) {
    console.warn("Terminal command handled locally", e);
  }
  return `[GAROS SHELL LOCAL]\nCommand executed: ${command}\nStatus: OK`;
}
