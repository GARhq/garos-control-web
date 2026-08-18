// @deprecated — server.ts será removido. Backend canônico é o
// `garos-backend` Rust (Axum + JWT + SQLx). Ver ADR-001 no vault.
// Não adicionar endpoints aqui; abrir card em KCR-BE001 pra trabalho no Rust.
// Mantido apenas o `/api/terminal` (node-pty) até port pro Rust.

import { GarAdapter } from './src/lib/gar-adapter.ts';
import { WebSocketServer } from 'ws';
import * as pty from 'node-pty';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database State representing a NixOS + Libvirt + Proxmox VE Cluster
let clusterName = "KRYONIX-DATACENTER";
let clusterQuorate = true;

// GAROS Diskless Server State
let garosDevices = [
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

let garosPxeImages = [
  { id: 'img-01', name: 'NixOS-Thin-Client-v2.6', kernel: '6.6.21-garos-lts', args: 'initrd=initrd ip=dhcp console=ttyS0 boot.shell_on_fail', sizeMb: 420, status: 'Active', lastUpdated: 'Hoje, 10:15' },
  { id: 'img-02', name: 'GAROS-Rescue-Shell-v1.4', kernel: '6.1.72-rescue', args: 'initrd=initrd_rescue ip=dhcp rescue_mode=true nomodeset', sizeMb: 180, status: 'Active', lastUpdated: 'Ontem, 18:30' },
  { id: 'img-03', name: 'Alpine-Diskless-GAROS-v3.19', kernel: '6.6.8-alpine', args: 'initrd=initramfs-alpine ip=dhcp alpine_dev=nfs', sizeMb: 95, status: 'Idle', lastUpdated: '12 Jul 2026' },
];

let garosSessions = [
  { id: 'sess-01', username: 'aguiarrocha (Gabriel Rocha)', deviceIp: '192.168.1.150', terminalServer: 'garos-primary', idleTime: 'Agora', cpuPct: 18, memPct: 42, status: 'Active' },
  { id: 'sess-02', username: 'operator-01 (Carlos Silva)', deviceIp: '192.168.1.151', terminalServer: 'garos-primary', idleTime: '2m 14s', cpuPct: 35, memPct: 58, status: 'Active' },
  { id: 'sess-03', username: 'user-alpha (Mariana Lima)', deviceIp: '192.168.1.154', terminalServer: 'garos-primary', idleTime: '15m 03s', cpuPct: 78, memPct: 82, status: 'Idle' },
];

let garosServices = [
  { name: 'tftp-server (PXE)', status: 'running', uptime: '15d 4h', cpu: 0.2, memory: 32 },
  { name: 'nfs-kernel-server (RootFS)', status: 'running', uptime: '15d 4h', cpu: 2.4, memory: 512 },
  { name: 'dnsmasq (ProxyDHCP)', status: 'running', uptime: '15d 4h', cpu: 0.1, memory: 18 },
  { name: 'garos-wol-proxy', status: 'running', uptime: '15d 4h', cpu: 0.05, memory: 12 },
  { name: 'nix-daemon (Store)', status: 'running', uptime: '30d 2h', cpu: 0.8, memory: 120 },
  { name: 'sshd (Remote Mgmt)', status: 'running', uptime: '120d', cpu: 0.1, memory: 8 },
];

let garosAuditLogs = [
  { id: 1, time: new Date(Date.now() - 60000).toLocaleString(), level: 'success', source: 'pxe-boot', message: 'Estação thin-client-01 (192.168.1.150) iniciou via TFTP', user: 'aguiarrocha' },
  { id: 2, time: new Date(Date.now() - 180000).toLocaleString(), level: 'info', source: 'nfs-server', message: 'RootFS montado via NFSv4 para lab-pc-01', user: 'system' },
  { id: 3, time: new Date(Date.now() - 400000).toLocaleString(), level: 'warning', source: 'wol-proxy', message: 'Pacote Magic Packet WOL transmitido no broadcast 192.168.1.255', user: 'aguiarrocha' },
  { id: 4, time: new Date(Date.now() - 900000).toLocaleString(), level: 'info', source: 'auth-service', message: 'Sessão aberta para operator-01 em thin-client-02', user: 'operator-01' },
  { id: 5, time: new Date(Date.now() - 1800000).toLocaleString(), level: 'success', source: 'nix-builder', message: 'Imagem NixOS-Thin-Client-v2.6 recompilada e promovida no TFTP', user: 'aguiarrocha' },
];

let nodes = [
  { id: "pve-01", name: "pve-01", hostname: "pve-01-nixos", mac: "00:1A:2B:3C:4D:5E", ip: "192.168.1.10", status: "online", generation: "#142", uptime: "15d 4h", authorized: true, cpu: 0.12, mem: 0.45, disk: 0.32 },
  { id: "pve-02", name: "pve-02", hostname: "pve-02-nixos", mac: "00:1A:2B:3C:4D:5F", ip: "192.168.1.11", status: "online", generation: "#142", uptime: "4d 21h", authorized: true, cpu: 0.08, mem: 0.33, disk: 0.15 },
  { id: "pve-03", name: "pve-03", hostname: "pve-03-nixos", mac: "00:1A:2B:3C:4D:60", ip: "192.168.1.12", status: "offline", generation: "#141", uptime: "0s", authorized: true, cpu: 0, mem: 0, disk: 0 },
  { id: "pve-04", name: "pve-04", hostname: "pve-04-nixos", mac: "00:1A:2B:3C:4D:61", ip: "192.168.1.13", status: "online", generation: "#142", uptime: "2h 15m", authorized: true, cpu: 0.05, mem: 0.22, disk: 0.10 },
  { id: "pve-05", name: "pve-05", hostname: "pve-05-nixos", mac: "00:1A:2B:3C:4D:62", ip: "192.168.1.14", status: "online", generation: "#142", uptime: "1d 12h", authorized: false, cpu: 0.02, mem: 0.11, disk: 0.05 }
];

let vms = [
  { id: 101, name: "debian-prod", status: "running", cpu: 0.05, mem: 2048, type: "qemu", node: "pve-01", sockets: 2, cores: 4, memory: 4096, net0: "virtio=AA:BB:CC:DD:EE:FF,bridge=vmbr0,firewall=1", scsi0: "local-lvm:vm-101-disk-0,size=32G", boot: "order=scsi0;ide2;net0", ostype: "l26" },
  { id: 102, name: "ubuntu-bkp", status: "stopped", cpu: 0, mem: 1024, type: "qemu", node: "pve-01", sockets: 1, cores: 2, memory: 2048, net0: "virtio=AA:BB:CC:00:EE:FF,bridge=vmbr0,firewall=0", scsi0: "local-lvm:vm-102-disk-0,size=50G", boot: "order=scsi0;net0", ostype: "l26" },
  { id: 103, name: "docker-host", status: "running", cpu: 0.15, mem: 8192, type: "lxc", node: "pve-01", sockets: 1, cores: 8, memory: 8192, net0: "virtio=11:22:33:44:55:66,bridge=vmbr0,firewall=1", scsi0: "local-lvm:subvol-103-disk-0,size=100G", boot: "order=scsi0", ostype: "alpine" },
  { id: 104, name: "nixos-proxy", status: "running", cpu: 0.02, mem: 512, type: "lxc", node: "pve-02", sockets: 1, cores: 2, memory: 1024, net0: "virtio=22:33:44:55:66:77,bridge=vmbr1,firewall=1", scsi0: "local-lvm:subvol-104-disk-0,size=20G", boot: "order=scsi0", ostype: "nixos" },
  { id: 105, name: "zfs-storage-ct", status: "running", cpu: 0.01, mem: 4096, type: "qemu", node: "pve-02", sockets: 2, cores: 4, memory: 8192, net0: "virtio=33:44:55:66:77:88,bridge=vmbr0,firewall=1", scsi0: "backup-zfs:vm-105-disk-0,size=500G", boot: "order=scsi0", ostype: "l26" }
];

let services = [
  { name: 'dnsmasq', status: 'running', uptime: '12d 4h', cpu: 0.2, memory: 12 },
  { name: 'nginx-gateway', status: 'running', uptime: '45d 1h', cpu: 1.5, memory: 256 },
  { name: 'nfs-kernel-server', status: 'running', uptime: '12d 4h', cpu: 4.5, memory: 1024 },
  { name: 'prometheus-exporter', status: 'running', uptime: '12d 4h', cpu: 2.1, memory: 128 },
  { name: 'grafana-server', status: 'running', uptime: '12d 4h', cpu: 1.5, memory: 512 },
  { name: 'sshd', status: 'running', uptime: '120d 8h', cpu: 0.1, memory: 8 },
  { name: 'kve-firewall', status: 'failed', uptime: '0s', cpu: 0, memory: 0 },
  { name: 'tftp-server', status: 'running', uptime: '12d 4h', cpu: 0.5, memory: 32 },
  { name: 'nix-daemon', status: 'running', uptime: '30d 2h', cpu: 0.8, memory: 64 },
  { name: 'redis-cache', status: 'stopped', uptime: '0s', cpu: 0, memory: 0 },
  { name: 'libvirtd', status: 'running', uptime: '15d 4h', cpu: 1.2, memory: 180 },
  { name: 'pveproxy', status: 'running', uptime: '15d 4h', cpu: 2.5, memory: 310 }
];

let tasks = [
  { id: 'UPID:pve-01:00001:00001', startTime: Date.now() - 300000, endTime: Date.now() - 240000, node: 'pve-01', user: 'root@pam', description: 'VM 101 Start', status: 'OK' },
  { id: 'UPID:pve-01:00002:00002', startTime: Date.now() - 600000, endTime: Date.now() - 580000, node: 'pve-01', user: 'root@pam', description: 'VM 102 Backup', status: 'OK' },
  { id: 'UPID:pve-02:00003:00003', startTime: Date.now() - 50000, endTime: null, node: 'pve-02', user: 'root@pam', description: 'Storage Migration', status: 'RUNNING' },
  { id: 'UPID:pve-01:00004:00004', startTime: Date.now() - 1000000, endTime: Date.now() - 950000, node: 'pve-01', user: 'root@pam', description: 'Apt-get update', status: 'OK' },
  { id: 'UPID:pve-01:00005:00005', startTime: Date.now() - 2000000, endTime: Date.now() - 1980000, node: 'pve-01', user: 'root@pam', description: 'Firewall Reload', status: 'OK' },
];

let snapshotsByVm: Record<string, any[]> = {
  "101": [
    { name: 'current', description: 'You are here', time: Date.now(), parent: 'snap-02' },
    { name: 'snap-02', description: 'Post-config-update', time: Date.now() - 86400000, parent: 'snap-01' },
    { name: 'snap-01', description: 'Fresh Install (Clean)', time: Date.now() - 172800000, parent: null },
  ],
  "102": [
    { name: 'current', description: 'You are here', time: Date.now(), parent: null }
  ]
};

let storageContents: Record<string, any[]> = {
  "local-lvm": [
    { name: "debian-12-standard_12.0-1_amd64.tar.zst", type: "vztmpl", size: "124MB", date: "2024-01-10" },
    { name: "ubuntu-24.04-live-server-amd64.iso", type: "iso", size: "2.1GB", date: "2024-04-25" },
    { name: "vzdump-qemu-101-2024_05_01.vma.zst", type: "backup", size: "1.2GB", date: "2024-05-01" },
  ],
  "backup-zfs": [
    { name: "vzdump-qemu-103-2024_05_12.vma.zst", type: "backup", size: "4.8GB", date: "2024-05-12" },
    { name: "nixos-minimal-23.11-x86_64.iso", type: "iso", size: "940MB", date: "2024-02-18" }
  ]
};

// Track interactive NixOS declarative generations
let nixosConfig = `#{
#   declarative NixOS core configuration for Proxmox/Libvirt cluster
#}
{ config, pkgs, ... }:

{
  imports = [ ./hardware-configuration.nix ];

  # Virtualization & container support
  virtualisation.libvirtd = {
    enable = true;
    qemu = {
      package = pkgs.qemu_kvm;
      runAsRoot = true;
    };
  };

  # Clustering networking
  networking.bridges.vmbr0.interfaces = [ "enp0s3" ];
  networking.interfaces.vmbr0.ipv4.addresses = [{
    address = "192.168.1.10";
    prefixLength = 24;
  }];

  # Distributed file system mounts
  fileSystems."/export/nix-store" = {
    device = "/dev/nvme0n1p2";
    fsType = "btrfs";
    options = [ "compress=zstd" "subvol=nix-store" ];
  };

  services.nfs.server = {
    enable = true;
    exports = ''
      /export/home       192.168.1.0/24(rw,sync,no_root_squash)
      /export/nix-store  192.168.1.0/24(ro,async,no_root_squash)
    '';
  };
}`;

async function startServer() {
  const app = express();

const wss = new WebSocketServer({ port: 3001 });
wss.on('connection', (ws) => {
  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env as any
  });
  shell.onData((data) => ws.send(data));
  ws.on('message', (msg) => shell.write(msg.toString()));
  ws.on('close', () => shell.kill());
});

  const PORT = 3000;

  app.use(express.json());

  // Helper helper to log server-side VM operations directly to Cluster Task Log
  const logClusterTask = (node: string, description: string, user = "root@pam") => {
    const task = {
      id: `UPID:${node}:${Math.floor(Math.random() * 90000 + 10000)}:${Math.floor(Math.random() * 90000 + 10000)}`,
      startTime: Date.now(),
      endTime: Date.now() + 5000, // completes fast
      node,
      user,
      description,
      status: 'OK'
    };
    tasks.unshift(task); // Add to beginning of tasks list
    return task;
  };

  // ---------------- API ENDPOINTS ---------------- //


  // GAROS Bare-Metal Server Status API
  app.get("/api/garos/status", async (req, res) => {
    try {
      const status = await GarAdapter.getStatus();
      res.json(status);
    } catch (e) {
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  // GAROS Netboot Devices List
  app.get("/api/garos/devices", async (req, res) => {
    try {
      const devices = await GarAdapter.getDevices();
      res.json(devices);
    } catch (e) {
      res.status(500).json({ error: "Failed to get devices" });
    }
  });

  // Send Wake-on-LAN (WOL)
  app.post("/api/garos/devices/wol", async (req, res) => {
    try {
      const { mac } = req.body;
      const device = await GarAdapter.wakeDevice(mac);
      res.json({ success: true, device });
    } catch (e) {
      res.status(500).json({ error: "Failed to wake device" });
    }
  });

  // Update Assigned PXE Image for Device
  app.put("/api/garos/devices/:mac/image", async (req, res) => {
    try {
      const { mac } = req.params;
      const { assignedImageId } = req.body;
      const device = await GarAdapter.setDeviceImage(mac, assignedImageId);
      res.json({ success: true, device });
    } catch (e) {
      res.status(500).json({ error: "Failed to set device image" });
    }
  });

  // Reboot Device
  app.post("/api/garos/devices/:mac/reboot", async (req, res) => {
    try {
      const { mac } = req.params;
      const device = await GarAdapter.rebootDevice(mac);
      res.json({ success: true, device });
    } catch (e) {
      res.status(500).json({ error: "Failed to reboot device" });
    }
  });

  // Send Terminal Message
  app.post("/api/garos/devices/:mac/message", async (req, res) => {
    try {
      const { mac } = req.params;
      const { message } = req.body;
      await GarAdapter.sendMessage(mac, message);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // GAROS PXE Images List
  app.get("/api/garos/pxe/images", async (req, res) => {
    try {
      const images = await GarAdapter.getImages();
      res.json(images);
    } catch (e) {
      res.status(500).json({ error: "Failed to get images" });
    }
  });

  // Create new PXE Image
  app.post("/api/garos/pxe/images", async (req, res) => {
    try {
      const { name, kernel, args } = req.body;
      const newImg = await GarAdapter.buildImage(name, kernel, args);
      res.json(newImg);
    } catch (e) {
      res.status(500).json({ error: "Failed to build image" });
    }
  });

  // GAROS Active Sessions
  app.get("/api/garos/sessions", async (req, res) => {
    try {
      const sessions = await GarAdapter.getSessions();
      res.json(sessions);
    } catch (e) {
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  // Terminate Active Session
  app.delete("/api/garos/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await GarAdapter.killSession(id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to kill session" });
    }
  });

  // GAROS System Services
  app.get("/api/garos/services", async (req, res) => {
    try {
      const services = await GarAdapter.getServices();
      res.json(services);
    } catch (e) {
      res.status(500).json({ error: "Failed to get services" });
    }
  });

  // GAROS Service Action
  app.post("/api/garos/services/:name/action", async (req, res) => {
    try {
      const { name } = req.params;
      const { action } = req.body;
      const srv = await GarAdapter.serviceAction(name, action);
      res.json({ success: true, service: srv });
    } catch (e) {
      res.status(500).json({ error: "Failed to execute service action" });
    }
  });

  // GAROS Audit Logs
  app.get("/api/garos/logs", async (req, res) => {
    try {
      const logs = await GarAdapter.getLogs();
      res.json(logs);
    } catch (e) {
      res.status(500).json({ error: "Failed to get logs" });
    }
  });


  // GAROS Terminal Command Executor
  app.post("/api/garos/terminal/exec", (req, res) => {
    const { command } = req.body;
    const cmd = (command || "").trim().toLowerCase();

    let output = "";
    if (cmd === "help") {
      output = `[GAROS DISKLESS SYSTEM SHELL v2.6.4]
Comandos disponíveis no servidor:
  status         - Exibe saúde dos serviços TFTP, NFS, ProxyDHCP e WOL
  devices        - Lista todas as estações e IPs atribuídos
  pxe-list       - Lista as imagens de boot disponíveis no nix-store
  wol <mac>      - Transmite pacote Magic Packet para o endereço MAC
  nfsstat        - Exibe estatísticas de E/S de leitura do RootFS
  clear          - Limpa o terminal atual`;
    } else if (cmd === "status") {
      output = `● garos-server.service - GAROS Diskless Core Network Service
   Loaded: loaded (/etc/systemd/system/garos.service; enabled)
   Active: active (running) since Wed 2026-08-12 04:12:00 UTC
   TFTP Boot: Active (Port 69 UDP)
   NFS Export: /export/nix-store, /export/home (NFSv4)
   Active Thin Clients: ${garosDevices.filter(d=>d.status==='Online').length} Online / ${garosDevices.length} Total`;
    } else if (cmd === "devices") {
      output = garosDevices.map(d => `${d.hostname.padEnd(16)} | MAC: ${d.mac} | IP: ${d.ip.padEnd(15)} | Status: ${d.status} | User: ${d.currentUser}`).join("\n");
    } else if (cmd.startsWith("wol ")) {
      const targetMac = cmd.replace("wol ", "").trim();
      output = `[WOL PROXY] Pacote Magic Packet (102 bytes) transmitido via UDP broadcast 192.168.1.255:9 para ${targetMac}.\nStatus: SUCESSO.`;
    } else if (cmd === "nfsstat") {
      output = `NFSv4 Server Stats (/export/nix-store):
  Read IOPs: 14,280 ops/sec
  Write IOPs: 850 ops/sec
  Throughput: 1.25 Gbps
  Average Latency: 0.14 ms`;
    } else {
      output = `garos-shell: comando executado: '${command}'\n[OK] Retorno do kernel 0x0. Servidor operando normalmente.`;
    }

    logClusterTask("garos-primary", `Comando CLI executado no terminal: "${command}"`);
    res.json({ output });
  });

  // Cluster Status Info
  app.get("/api/cluster/status", (req, res) => {
    const totalCores = vms.reduce((acc, curr) => acc + (curr.cores || 2), 0);
    const totalMemory = vms.reduce((acc, curr) => acc + (curr.memory || 1024), 0);
    const onlineNodes = nodes.filter(n => n.status === "online").length;

    res.json({
      name: clusterName,
      quorate: clusterQuorate,
      nodes: nodes.length,
      onlineNodes: onlineNodes,
      vms: vms.length,
      runningVms: vms.filter(v => v.status === "running").length,
      storage: "Healthy",
      totalCores,
      totalMemory,
    });
  });

  // Cluster Tasks Logger
  app.get("/api/cluster/tasks", (req, res) => {
    res.json(tasks);
  });

  // List Services
  app.get("/api/services", (req, res) => {
    res.json(services);
  });

  // Trigger Action on Service (Start, Stop, Restart)
  app.post("/api/services/:name/action", (req, res) => {
    const { name } = req.params;
    const { action } = req.body; // 'start' | 'stop' | 'restart'
    
    const serviceIndex = services.findIndex(s => s.name === name);
    if (serviceIndex === -1) {
      return res.status(404).json({ error: "Service not found" });
    }

    const service = services[serviceIndex];
    if (action === "start") {
      service.status = "running";
      service.uptime = "5s";
      service.cpu = Math.random() * 2 + 0.1;
      service.memory = Math.floor(Math.random() * 128 + 12);
    } else if (action === "stop") {
      service.status = "stopped";
      service.uptime = "0s";
      service.cpu = 0;
      service.memory = 0;
    } else if (action === "restart") {
      service.status = "running";
      service.uptime = "1s";
      service.cpu = Math.random() * 5 + 1;
    }

    logClusterTask("pve-01", `Systemd Service ${name} ${action.toUpperCase()}ED`);
    res.json({ success: true, service });
  });

  // Nodes Listing
  app.get("/api/nodes", (req, res) => {
    res.json(nodes);
  });

  // Scan network to find pending nodes
  app.post("/api/nodes/scan", (req, res) => {
    const activeScans = [
      { id: "pve-05", name: "pve-05", hostname: "pve-05-nixos", mac: "00:1A:2B:3C:4D:62", ip: "192.168.1.14", status: "online", generation: "#142", uptime: "1d 12h", authorized: false, cpu: 0.02, mem: 0.11, disk: 0.05 }
    ];
    // If not in node list of nodes, let's restore/re-add
    const exists = nodes.some(n => n.id === "pve-05");
    if (!exists) {
      nodes.push(activeScans[0]);
    }
    logClusterTask("pve-01", "Completed Network Ping scan");
    res.json({ success: true, scanned: nodes });
  });

  // Authorize dynamic cluster node
  app.post("/api/nodes/:nodeId/authorize", (req, res) => {
    const { nodeId } = req.params;
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      node.authorized = true;
      logClusterTask(nodeId, `Node Authorized in Cluster`);
      res.json({ success: true, node });
    } else {
      res.status(404).json({ error: "Node not found" });
    }
  });

  // Authorize All pending nodes
  app.post("/api/nodes/authorize-all", (req, res) => {
    nodes.forEach(n => {
      if (!n.authorized) {
        n.authorized = true;
        logClusterTask(n.id, `Node Authorized in Cluster`);
      }
    });
    res.json({ success: true, nodes });
  });

  // Command Action on Node itself (reboot, shutdown)
  app.post("/api/nodes/:nodeId/action", (req, res) => {
    const { nodeId } = req.params;
    const { action } = req.body; // 'reboot' | 'shutdown'
    const node = nodes.find(n => n.id === nodeId);

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    if (action === "reboot") {
      node.status = "online";
      node.uptime = "1s";
      logClusterTask(nodeId, `Node GRACEFUL REBOOT triggered`);
    } else if (action === "shutdown") {
      node.status = "offline";
      node.uptime = "0s";
      logClusterTask(nodeId, `Node POWER OFF triggered`);
    }

    res.json({ success: true, node });
  });

  // Get VMs for a Node
  app.get("/api/nodes/:node/vms", (req, res) => {
    const { node } = req.params;
    const nodeVms = vms.filter(v => v.node === node || !node);
    res.json(nodeVms);
  });

  // Create empty Virtual Machine / Container (Declarative QEMU/LXC build)
  app.post("/api/nodes/:node/vms/create", (req, res) => {
    const { node } = req.params;
    const { name, type, memory, cores, sockets, ostype } = req.body;

    const nextId = Math.max(...vms.map(v => v.id), 100) + 1;
    const newVm = {
      id: nextId,
      name: name || `vm-${nextId}`,
      status: "stopped",
      cpu: 0,
      mem: 0,
      type: type || "qemu",
      node,
      sockets: parseInt(sockets) || 1,
      cores: parseInt(cores) || 2,
      memory: parseInt(memory) || 2048,
      net0: `virtio=FE:ED:00:${Math.floor(Math.random()*90)}:EE:FF,bridge=vmbr0,firewall=1`,
      scsi0: `local-lvm:vm-${nextId}-disk-0,size=20G`,
      boot: "order=scsi0;net0",
      ostype: ostype || "l26"
    };

    vms.push(newVm);
    snapshotsByVm[nextId.toString()] = [
      { name: 'current', description: 'Fresh deployment space', time: Date.now(), parent: null }
    ];

    logClusterTask(node, `Created declarative VM resource ${nextId} (${newVm.name})`);
    res.json({ success: true, vm: newVm });
  });

  // VM trigger commands (start, stop, reboot, reset)
  app.post("/api/nodes/:node/vms/:vmid/status", (req, res) => {
    const { node, vmid } = req.params;
    const { action } = req.body; // "start" | "stop" | "reboot" | "reset"
    const vm = vms.find(v => v.id === parseInt(vmid));

    if (!vm) {
      return res.status(404).json({ error: "Virtual Machine not found" });
    }

    if (action === "start") {
      vm.status = "running";
      vm.cpu = Math.random() * 0.15 + 0.01;
      vm.mem = vm.memory;
    } else if (action === "stop") {
      vm.status = "stopped";
      vm.cpu = 0;
      vm.mem = 0;
    } else if (action === "reboot" || action === "reset") {
      vm.status = "running";
      vm.cpu = Math.random() * 0.2 + 0.05;
      vm.mem = vm.memory;
    }

    logClusterTask(node, `Task: VM ${vmid} -- ${action.toUpperCase()}`);
    res.json({ success: true, vm });
  });

  // Get VM config hardware
  app.get("/api/nodes/:node/vms/:vmid/config", (req, res) => {
    const { vmid } = req.params;
    const vm = vms.find(v => v.id === parseInt(vmid));
    if (vm) {
      res.json(vm);
    } else {
      res.json({
        sockets: 2,
        cores: 4,
        memory: 4096,
        net0: "virtio=AA:BB:CC:DD:EE:FF,bridge=vmbr0,firewall=1",
        scsi0: "local-lvm:vm-101-disk-0,size=32G",
        boot: "order=scsi0;ide2;net0",
        ostype: "l26",
        name: "unknown-vm"
      });
    }
  });

  // Modify VM hardware configuration
  app.post("/api/nodes/:node/vms/:vmid/config", (req, res) => {
    const { node, vmid } = req.params;
    const update = req.body; // memory, cores, sockets, etc.
    const vm = vms.find(v => v.id === parseInt(vmid));

    if (!vm) {
      return res.status(404).json({ error: "VM not found" });
    }

    if (update.memory) vm.memory = parseInt(update.memory);
    if (update.cores) vm.cores = parseInt(update.cores);
    if (update.sockets) vm.sockets = parseInt(update.sockets);
    if (update.net0) vm.net0 = update.net0;
    if (update.scsi0) vm.scsi0 = update.scsi0;

    logClusterTask(node, `Updated configuration settings for VM ${vmid}`);
    res.json({ success: true, config: vm });
  });

  // Get snapshots of VM
  app.get("/api/nodes/:node/vms/:vmid/snapshots", (req, res) => {
    const { vmid } = req.params;
    const vmSnaps = snapshotsByVm[vmid] || [{ name: 'current', description: 'Snapshot layer space', time: Date.now(), parent: null }];
    res.json(vmSnaps);
  });

  // Create Snapshot
  app.post("/api/nodes/:node/vms/:vmid/snapshots", (req, res) => {
    const { node, vmid } = req.params;
    const { name, description } = req.body;

    if (!snapshotsByVm[vmid]) {
      snapshotsByVm[vmid] = [];
    }

    // Insert new snapshot right before current
    const currentIdx = snapshotsByVm[vmid].findIndex(s => s.name === 'current');
    const newSnap = {
      name: name || `snap-${Math.floor(Math.random()*1000)}`,
      description: description || 'No description provided',
      time: Date.now(),
      parent: currentIdx !== -1 ? snapshotsByVm[vmid][currentIdx].parent : null
    };

    if (currentIdx !== -1) {
      snapshotsByVm[vmid][currentIdx].parent = newSnap.name;
      snapshotsByVm[vmid].splice(currentIdx, 0, newSnap);
    } else {
      snapshotsByVm[vmid].push(newSnap);
      snapshotsByVm[vmid].push({ name: 'current', description: 'You are here', time: Date.now(), parent: newSnap.name });
    }

    logClusterTask(node, `Created VM snapshot: ${newSnap.name} for Ref ${vmid}`);
    res.json({ success: true, snapshots: snapshotsByVm[vmid] });
  });

  // Delete Snapshot
  app.delete("/api/nodes/:node/vms/:vmid/snapshots/:snapname", (req, res) => {
    const { node, vmid, snapname } = req.params;
    if (snapshotsByVm[vmid]) {
      snapshotsByVm[vmid] = snapshotsByVm[vmid].filter(s => s.name !== snapname);
      logClusterTask(node, `Deleted VM snapshot: ${snapname}`);
      res.json({ success: true, snapshots: snapshotsByVm[vmid] });
    } else {
      res.status(404).json({ error: "VM or snapshot space empty" });
    }
  });

  // Restore/Rollback to snapshot
  app.post("/api/nodes/:node/vms/:vmid/snapshots/:snapname/rollback", (req, res) => {
    const { node, vmid, snapname } = req.params;
    logClusterTask(node, `Rolled back VM ${vmid} disk state to: ${snapname}`);
    res.json({ success: true });
  });

  // Storage contents
  app.get("/api/storage/:storageId/content", (req, res) => {
    const { storageId } = req.params;
    res.json(storageContents[storageId] || []);
  });

  // Delete Storage Item
  app.delete("/api/storage/:storageId/content/:itemName", (req, res) => {
    const { storageId, itemName } = req.params;
    if (storageContents[storageId]) {
      storageContents[storageId] = storageContents[storageId].filter(item => item.name !== itemName);
      logClusterTask("pve-01", `Disk Image/File DELETED from storage ${storageId}: ${itemName}`);
      res.json({ success: true, remaining: storageContents[storageId] });
    } else {
      res.status(404).json({ error: "Storage pool index missing" });
    }
  });

  // Add upload / create item to Storage
  app.post("/api/storage/:storageId/content", (req, res) => {
    const { storageId } = req.params;
    const { name, type, size } = req.body;

    const newItem = {
      name: name || `iso-image-${Math.floor(Math.random()*100)}.iso`,
      type: type || "iso",
      size: size || "1.5GB",
      date: new Date().toISOString().split('T')[0]
    };

    if (!storageContents[storageId]) {
      storageContents[storageId] = [];
    }
    storageContents[storageId].push(newItem);

    logClusterTask("pve-01", `Uploaded ISO template to pool ${storageId}: ${newItem.name}`);
    res.json({ success: true, files: storageContents[storageId] });
  });

  // Interactive Live terminal output router with custom command executing simulator
  app.get("/api/nodes/:node/terminal", (req, res) => {
    const { node } = req.params;
    const lines = [
      `[  OK  ] Started NixOS System Logger / nix-daemon.`,
      `[  OK  ] Mounted declarative mountpoint /export/nix-store.`,
      `[  OK  ] Reached target System Cluster Services.`,
      `[  OK  ] Started Libvirt Daemon & QEMU virtualisation driver.`,
      ``,
      `=============================================================`,
      `  KRYONIX VE virtualised nixos-node shell v6.6-nix kernel        `,
      `  Admin nodes are running Proxmox APIs & Libvirt integrations `,
      `=============================================================`,
      ``,
      `Welcome back root user under host node: ${node}`,
      `Last session check: ${new Date().toLocaleString()} from local bridge 192.168.1.50`,
      ``,
      `Type 'help' to check active hypervisor CLI options.`,
      `root@${node}:~# `
    ];
    res.json({ output: lines.join('\n') });
  });

  // Get active NixOS generation code
  app.get("/api/nixos/config", (req, res) => {
    res.json({
      config: nixosConfig,
      generation: 142,
      activeKernel: "6.6.14-rt-pve",
      lastRebuildTime: "May 28, 2026 14:15:22"
    });
  });

  // Rebuild declarative configs (simulates declarative sys sync)
  app.post("/api/nixos/rebuild", (req, res) => {
    const { config } = req.body;
    if (config) {
      nixosConfig = config;
    }
    logClusterTask("pve-01", "Completed NixOS config rebuild --switch");
    res.json({
      success: true,
      generation: 143,
      stdout: [
        "evaluating configuration...",
        "building Nix archive closures...",
        "creating gen links links/143-link...",
        "copied /nix/store/10419d...-nixos-system-node-01...",
        "activating system profiles...",
        "reloading systemd modules...",
        "done. System switched to generation 143 successfully."
      ].join("\n")
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PVE-Inspired Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server", err);
});
