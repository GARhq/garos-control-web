import { useEffect } from 'react';
import { useGarosStore } from '../store/useGarosStore';

export function useGarosRealtime() {
  const isLiveFeedActive = useGarosStore((state) => state.isLiveFeedActive);

  useEffect(() => {
    if (!isLiveFeedActive) return;

    const interval = setInterval(() => {
      const store = useGarosStore.getState();

      // Fluctuate cpu/mem/temp on nodes slightly
      const updatedNodes = store.nodes.map((n) => {
        if (n.status === 'Online') {
          const cpuDelta = (Math.random() - 0.5) * 6;
          const memDelta = (Math.random() - 0.5) * 4;
          const tempDelta = (Math.random() - 0.5) * 2;
          return {
            ...n,
            cpuUsagePct: Math.min(99, Math.max(5, Math.round(n.cpuUsagePct + cpuDelta))),
            memUsagePct: Math.min(98, Math.max(10, Math.round(n.memUsagePct + memDelta))),
            cpuTempC: Math.min(85, Math.max(30, Math.round(n.cpuTempC + tempDelta))),
            pingMs: Number((Math.max(0.1, n.pingMs + (Math.random() - 0.5) * 0.2)).toFixed(1)),
          };
        }
        return n;
      });

      // Fluctuate connections bytes if not frozen
      let updatedConns = store.activeConnections;
      if (!store.isConnectionsFrozen) {
        updatedConns = store.activeConnections.map((c) => {
          const sentNum = parseFloat(c.bytesSent) + (Math.random() * 0.5);
          return {
            ...c,
            bytesSent: `${sentNum.toFixed(1)} GB`,
          };
        });
      }

      // Add a simulated live log line occasionally
      let updatedLogs = store.systemLogs;
      if (Math.random() > 0.4) {
        const servicesList = ['nfs-kernel-server', 'dnsmasq', 'tftp-server', 'garos-wol-proxy', 'nftables-firewall', 'sshd'];
        const srv = servicesList[Math.floor(Math.random() * servicesList.length)];
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          severity: (Math.random() > 0.85 ? 'WARN' : 'INFO') as 'INFO' | 'WARN',
          service: srv,
          message: `Heartbeat telemetry sync OK [bytes_transferred=${Math.floor(Math.random() * 8000 + 1000)}].`,
        };
        updatedLogs = [newLog, ...store.systemLogs.slice(0, 499)];
      }

      useGarosStore.setState({
        nodes: updatedNodes,
        activeConnections: updatedConns,
        systemLogs: updatedLogs,
        lastUpdateTimestamp: new Date().toLocaleTimeString(),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveFeedActive]);
}
