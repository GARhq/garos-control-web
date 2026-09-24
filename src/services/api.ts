import { 
  NetbootDevice, 
  PXEImageDetail, 
  ActiveSession, 
  GarosServerStatus, 
  GarosServerConfig, 
  AuditLog, 
  Service 
} from '../types';

// Helper for Base URL resolution (Browser vs Node.js test environment)
function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return '';
  }
  return process.env.GAROS_API_URL || 'http://localhost:8000';
}

// Helper for Auth headers (safely checking localStorage in Node / browser)
function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('garos_jwt_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

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
  { id: 'img-02', name: 'GAROS-Rescue-Shell-v1.4', kernel: '6.1.72-rescue', args: 'initrd=initramfs_rescue ip=dhcp rescue_mode=true nomodeset', sizeMb: 180, status: 'Active', lastUpdated: 'Ontem, 18:30' },
  { id: 'img-03', name: 'Alpine-Diskless-GAROS-v3.19', kernel: '6.6.8-alpine', args: 'initrd=initramfs-alpine ip=dhcp alpine_dev=nfs', sizeMb: 95, status: 'Idle', lastUpdated: '12 Jul 2026' },
];

const fallbackSessions: ActiveSession[] = [
  { id: 'sess-01', username: 'aguiarrocha (Gabriel Rocha)', deviceIp: '192.168.1.150', terminalServer: 'garos-primary', idleTime: 'Agora', cpuPct: 18, memPct: 42, status: 'Active' },
  { id: 'sess-02', username: 'operator-01 (Carlos Silva)', deviceIp: '192.168.1.151', terminalServer: 'garos-primary', idleTime: '2m 14s', cpuPct: 35, memPct: 58, status: 'Active' },
  { id: 'sess-03', username: 'user-alpha (Mariana Lima)', deviceIp: '192.168.1.154', terminalServer: 'garos-primary', idleTime: '15m 03s', cpuPct: 78, memPct: 82, status: 'Idle' },
];

// Mapper: Axum backend NetbootDevice (snake_case) -> NetbootDevice (camelCase)
export function mapRawNodeToNetbootDevice(raw: any): NetbootDevice {
  return {
    mac: raw.mac || '',
    ip: raw.ip || '192.168.1.100',
    hostname: raw.hostname || raw.mac || 'node-client',
    assignedImageId: raw.image_id || raw.assignedImageId || 'img-01',
    status: raw.status || 'Online',
    ramGb: raw.ram_gb ?? raw.ramGb ?? 4,
    cpuCores: raw.cpu_cores ?? raw.cpuCores ?? 2,
    currentUser: raw.current_user_id || raw.currentUser || 'Livre',
    currentUserRole: raw.current_user_role || raw.currentUserRole || 'Operador',
    loginTime: raw.login_at ? new Date(raw.login_at).toLocaleTimeString() : (raw.loginTime || 'N/A'),
    health: raw.health || (raw.status === 'Online' ? 'Excellent' : 'Offline'),
    cpuTempC: raw.cpu_temp_c ?? raw.cpuTempC ?? 38,
    cpuUsagePct: raw.cpu_usage_pct ?? raw.cpuUsagePct ?? 15,
    memUsagePct: raw.mem_usage_pct ?? raw.memUsagePct ?? 40,
    fanSpeedRpm: raw.fan_rpm ?? raw.fanSpeedRpm ?? 1800,
    pingMs: raw.ping_ms ?? raw.pingMs ?? 0.4,
    networkLink: raw.network_link || raw.networkLink || '1 Gbps RJ45',
    nfsLatencyMs: raw.nfs_latency_ms ?? raw.nfsLatencyMs ?? 0.2,
    hardwareModel: raw.hardware_model || raw.hardwareModel || 'Generic Diskless Node',
    uptime: raw.uptime || '1h 20m',
  };
}

export function mapRawPxeImage(raw: any): PXEImageDetail {
  return {
    id: raw.id || raw.image_id || 'img-01',
    name: raw.name || raw.filename || 'GAROS-Netboot-Image',
    kernel: raw.kernel || 'bzImage',
    args: raw.args || 'initrd=initrd ip=dhcp',
    sizeMb: raw.size_mb || raw.sizeMb || 450,
    status: raw.status || 'Active',
    lastUpdated: raw.last_updated || raw.lastUpdated || 'Hoje',
  };
}

export function mapRawAuditLog(raw: any): AuditLog {
  return {
    id: raw.id || Math.floor(Math.random() * 1000),
    time: raw.created_at ? new Date(raw.created_at).toLocaleTimeString() : (raw.time || 'Agora'),
    level: raw.level || 'info',
    source: raw.source || 'system',
    message: raw.message || raw.action || '',
    user: raw.user_id || raw.user || 'system',
  };
}

// REST API Methods with real endpoints + fallbacks
export async function fetchGarosDevices(): Promise<NetbootDevice[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/nodes`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapRawNodeToNetbootDevice);
      }
    }
  } catch (e) {
    console.warn("API offline or error fetching real nodes, using fallback:", e);
  }
  return fallbackDevices;
}

export async function sendWakeOnLan(mac: string): Promise<boolean> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/nodes/${encodeURIComponent(mac)}/wol`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
    const res = await fetch(`${getBaseUrl()}/api/garos/nodes/${encodeURIComponent(mac)}/image`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ image_id: assignedImageId }),
    });
    if (res.ok) return true;
  } catch (e) {
    console.error("Update device image API call failed", e);
  }
  return false;
}

export async function sendTerminalMessage(mac: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/nodes/${encodeURIComponent(mac)}/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
    const res = await fetch(`${getBaseUrl()}/api/garos/nodes/${encodeURIComponent(mac)}/reboot`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) return true;
  } catch (e) {
    console.error("Reboot device API call failed", e);
  }
  return false;
}

export async function fetchGarosPxeImages(): Promise<PXEImageDetail[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/images`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapRawPxeImage);
      }
    }
  } catch (e) {
    console.warn("API offline or error fetching real images, using fallback:", e);
  }
  return fallbackPxeImages;
}

export async function createGarosPxeImage(name: string, kernel: string, args: string): Promise<PXEImageDetail> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, kernel, args }),
    });
    if (res.ok) {
      const raw = await res.json();
      return mapRawPxeImage(raw);
    }
  } catch (e) {
    console.error("Create PXE image API call failed", e);
    throw e;
  }
  throw new Error("API Offline");
}

export async function fetchGarosSessions(): Promise<ActiveSession[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/activity`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn("API offline, using fallback sessions:", e);
  }
  return fallbackSessions;
}

export async function terminateSession(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/activity/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return true;
  } catch (e) {
    console.error("Session termination API call failed", e);
  }
  return false;
}

export async function fetchGarosServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/services`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn("API offline, using fallback services:", e);
  }
  return [];
}

export async function triggerGarosServiceAction(name: string, action: 'start' | 'stop' | 'restart'): Promise<boolean> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/services/${encodeURIComponent(name)}/action`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
    const res = await fetch(`${getBaseUrl()}/api/garos/audit`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapRawAuditLog);
      }
    }
  } catch (e) {
    console.warn("API offline, using fallback logs:", e);
  }
  return [];
}

export async function executeGarosTerminalCommand(command: string): Promise<string> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/garos/terminal/exec`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
