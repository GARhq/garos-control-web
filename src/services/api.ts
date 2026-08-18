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
    const res = await fetch('/api/garos/nodes');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch real devices state from API", e);
  }
  return [];
}

export async function sendWakeOnLan(mac: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/nodes/${encodeURIComponent(mac)}/wol`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mac }),
    });
    if (res.ok) return true;
  } catch (e) {
    console.error("WOL API call failed", e);
  }
  return false;
}

export async function updateDeviceImage(mac: string, assignedImageId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/nodes/${encodeURIComponent(mac)}/image`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedImageId }),
    });
    if (res.ok) return true;
  } catch (e) {
    console.error("Update device image API call failed", e);
  }
  return false;
}

export async function sendTerminalMessage(mac: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/nodes/${encodeURIComponent(mac)}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (res.ok) return true;
  } catch (e) {
    console.error("Terminal message API call failed", e);
  }
  return false;
}

export async function rebootTerminalDevice(mac: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/nodes/${encodeURIComponent(mac)}/reboot`, {
      method: 'POST',
    });
    if (res.ok) return true;
  } catch (e) {
    console.error("Reboot device API call failed", e);
  }
  return false;
}

export async function fetchGarosPxeImages(): Promise<PXEImageDetail[]> {
  try {
    const res = await fetch('/api/garos/images');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch real PXE images from API", e);
  }
  return [];
}

export async function createGarosPxeImage(name: string, kernel: string, args: string): Promise<PXEImageDetail> {
  try {
    const res = await fetch('/api/garos/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, kernel, args }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Create PXE image API call failed", e);
    throw e;
  }
  throw new Error("API Offline");
}

export async function fetchGarosSessions(): Promise<ActiveSession[]> {
  try {
    const res = await fetch('/api/garos/activity');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch real active sessions from API", e);
  }
  return [];
}

export async function terminateSession(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/garos/activity/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (e) {
    console.error("Session termination API call failed", e);
  }
  return false;
}

export async function fetchGarosServices(): Promise<Service[]> {
  try {
    const res = await fetch('/api/garos/services');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch real services from API", e);
  }
  return [];
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
    console.error("Service action API call failed", e);
  }
  return false;
}

export async function fetchGarosLogs(): Promise<AuditLog[]> {
  try {
    const res = await fetch('/api/garos/audit');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Failed to fetch real audit logs from API", e);
  }
  return [];
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
    console.error("Terminal command execution API call failed", e);
  }
  return `[ERRO] Sem conexão com a API de Controle do GAROS.`;
}
