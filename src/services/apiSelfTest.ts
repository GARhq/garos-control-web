import { 
  fetchGarosDevices, 
  fetchGarosPxeImages, 
  fetchGarosLogs, 
  fetchGarosSessions, 
  fetchGarosServices, 
  sendWakeOnLan, 
  updateDeviceImage, 
  rebootTerminalDevice, 
  triggerGarosServiceAction, 
  executeGarosTerminalCommand,
  mapRawNodeToNetbootDevice,
  mapRawPxeImage,
  mapRawAuditLog
} from './api';
import { NetbootDevice, PXEImageDetail, AuditLog } from '../types';

export interface SelfTestResult {
  name: string;
  category: 'Mapper' | 'Auth' | 'Endpoints' | 'Actions';
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface SelfTestSuiteReport {
  timestamp: string;
  passed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  results: SelfTestResult[];
}

export async function runGarosApiSelfTest(): Promise<SelfTestSuiteReport> {
  const results: SelfTestResult[] = [];
  const startTime = Date.now();

  // Test 1: Mapper - Raw snake_case Node -> NetbootDevice
  const test1Start = Date.now();
  try {
    const rawNode = {
      mac: '11:22:33:44:55:66',
      ip: '10.0.0.50',
      hostname: 'test-node-01',
      image_id: 'img-test-123',
      status: 'Online',
      ram_gb: 16,
      cpu_cores: 8,
      current_user_id: 'admin',
      current_user_role: 'Administrator',
      cpu_temp_c: 42.5,
      cpu_usage_pct: 25.0,
      mem_usage_pct: 50.0,
      fan_rpm: 2100,
      ping_ms: 0.5,
      nfs_latency_ms: 0.15,
      hardware_model: 'Dell PowerEdge R640',
      login_at: '2026-09-24T12:00:00Z',
    };
    const mapped: NetbootDevice = mapRawNodeToNetbootDevice(rawNode);
    const passed = mapped.mac === '11:22:33:44:55:66' &&
                   mapped.assignedImageId === 'img-test-123' &&
                   mapped.cpuTempC === 42.5 &&
                   mapped.cpuUsagePct === 25.0 &&
                   mapped.memUsagePct === 50.0 &&
                   mapped.fanSpeedRpm === 2100 &&
                   mapped.pingMs === 0.5 &&
                   mapped.nfsLatencyMs === 0.15 &&
                   mapped.hardwareModel === 'Dell PowerEdge R640';
    results.push({
      name: 'Mapper Node snake_case -> camelCase',
      category: 'Mapper',
      passed,
      message: passed ? 'Mapeamento de nós convertido perfeitamente.' : 'Falha ao converter propriedades de nó.',
      durationMs: Date.now() - test1Start,
    });
  } catch (e: any) {
    results.push({
      name: 'Mapper Node snake_case -> camelCase',
      category: 'Mapper',
      passed: false,
      message: `Erro no teste: ${e.message}`,
      durationMs: Date.now() - test1Start,
    });
  }

  // Test 2: Mapper - PXE Image
  const test2Start = Date.now();
  try {
    const rawImage = {
      id: 'img-999',
      name: 'Test-PXE-Kernel',
      kernel: '6.6.0-test',
      args: 'initrd=initrd.img',
      size_mb: 512,
      status: 'Active',
      last_updated: '2026-09-24',
    };
    const mapped: PXEImageDetail = mapRawPxeImage(rawImage);
    const passed = mapped.id === 'img-999' && mapped.sizeMb === 512 && mapped.name === 'Test-PXE-Kernel';
    results.push({
      name: 'Mapper PXE Image snake_case -> camelCase',
      category: 'Mapper',
      passed,
      message: passed ? 'Mapeamento de imagens PXE validado.' : 'Falha na conversão de imagem PXE.',
      durationMs: Date.now() - test2Start,
    });
  } catch (e: any) {
    results.push({
      name: 'Mapper PXE Image snake_case -> camelCase',
      category: 'Mapper',
      passed: false,
      message: `Erro no teste: ${e.message}`,
      durationMs: Date.now() - test2Start,
    });
  }

  // Test 3: Mapper - Audit Log
  const test3Start = Date.now();
  try {
    const rawAudit = {
      id: 101,
      created_at: '2026-09-24T14:00:00Z',
      level: 'info',
      source: 'test-suite',
      message: 'Self-test execution',
      user_id: 'tester',
    };
    const mapped: AuditLog = mapRawAuditLog(rawAudit);
    const passed = mapped.id === 101 && mapped.user === 'tester' && mapped.level === 'info';
    results.push({
      name: 'Mapper Audit Log conversion',
      category: 'Mapper',
      passed,
      message: passed ? 'Mapeamento de audit logs verificado.' : 'Falha ao mapear logs de auditoria.',
      durationMs: Date.now() - test3Start,
    });
  } catch (e: any) {
    results.push({
      name: 'Mapper Audit Log conversion',
      category: 'Mapper',
      passed: false,
      message: `Erro no teste: ${e.message}`,
      durationMs: Date.now() - test3Start,
    });
  }

  // Test 4: Endpoint Fetching - Nodes
  const test4Start = Date.now();
  try {
    const devices = await fetchGarosDevices();
    const passed = Array.isArray(devices) && devices.length > 0;
    results.push({
      name: 'Endpoint GET /api/garos/nodes (com Fallback)',
      category: 'Endpoints',
      passed,
      message: passed ? `Retornou ${devices.length} dispositivo(s).` : 'Retornou array vazio inesperado.',
      durationMs: Date.now() - test4Start,
    });
  } catch (e: any) {
    results.push({
      name: 'Endpoint GET /api/garos/nodes (com Fallback)',
      category: 'Endpoints',
      passed: false,
      message: `Exceção na chamada de nós: ${e.message}`,
      durationMs: Date.now() - test4Start,
    });
  }

  // Test 5: Endpoint Fetching - PXE Images
  const test5Start = Date.now();
  try {
    const images = await fetchGarosPxeImages();
    const passed = Array.isArray(images) && images.length > 0;
    results.push({
      name: 'Endpoint GET /api/garos/images (com Fallback)',
      category: 'Endpoints',
      passed,
      message: passed ? `Retornou ${images.length} imagem(ns) PXE.` : 'Retornou array de imagens vazio.',
      durationMs: Date.now() - test5Start,
    });
  } catch (e: any) {
    results.push({
      name: 'Endpoint GET /api/garos/images (com Fallback)',
      category: 'Endpoints',
      passed: false,
      message: `Exceção ao buscar imagens: ${e.message}`,
      durationMs: Date.now() - test5Start,
    });
  }

  // Test 6: Endpoint Fetching - Audit Logs & Sessions
  const test6Start = Date.now();
  try {
    const logs = await fetchGarosLogs();
    const sessions = await fetchGarosSessions();
    const passed = Array.isArray(logs) && Array.isArray(sessions);
    results.push({
      name: 'Endpoints GET /api/garos/audit & /activity',
      category: 'Endpoints',
      passed,
      message: passed ? `Logs: ${logs.length}, Sessões: ${sessions.length}` : 'Erro na leitura de logs ou sessões.',
      durationMs: Date.now() - test6Start,
    });
  } catch (e: any) {
    results.push({
      name: 'Endpoints GET /api/garos/audit & /activity',
      category: 'Endpoints',
      passed: false,
      message: `Exceção: ${e.message}`,
      durationMs: Date.now() - test6Start,
    });
  }

  // Test 7: Action Testing - WOL & Reboot safe call
  const test7Start = Date.now();
  try {
    const wolResult = await sendWakeOnLan('00:11:22:33:44:55');
    const rebootResult = await rebootTerminalDevice('00:11:22:33:44:55');
    // Calling these endpoints shouldn't crash
    results.push({
      name: 'Actions WOL & Reboot API Calls',
      category: 'Actions',
      passed: true,
      message: `WOL call: ${wolResult ? 'Sucesso' : 'Handled'}, Reboot call: ${rebootResult ? 'Sucesso' : 'Handled'}`,
      durationMs: Date.now() - test7Start,
    });
  } catch (e: any) {
    results.push({
      name: 'Actions WOL & Reboot API Calls',
      category: 'Actions',
      passed: false,
      message: `Falha ao executar chamadas de ação: ${e.message}`,
      durationMs: Date.now() - test7Start,
    });
  }

  // Test 8: Terminal Exec Call
  const test8Start = Date.now();
  try {
    const output = await executeGarosTerminalCommand('gar server status');
    const passed = typeof output === 'string' && output.length > 0;
    results.push({
      name: 'Terminal Command Exec Endpoint',
      category: 'Actions',
      passed,
      message: passed ? 'Retorno do terminal recebido com sucesso.' : 'Retorno do terminal vazio.',
      durationMs: Date.now() - test8Start,
    });
  } catch (e: any) {
    results.push({
      name: 'Terminal Command Exec Endpoint',
      category: 'Actions',
      passed: false,
      message: `Falha no terminal: ${e.message}`,
      durationMs: Date.now() - test8Start,
    });
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  const report: SelfTestSuiteReport = {
    timestamp: new Date().toISOString(),
    passed: failedCount === 0,
    total: results.length,
    passedCount,
    failedCount,
    results,
  };

  console.log(`[GAROS API Self-Test] Bateria executada em ${Date.now() - startTime}ms. Passaram ${passedCount}/${results.length}.`);
  return report;
}

// Global binding for browser console access
if (typeof window !== 'undefined') {
  (window as any).runGarosApiSelfTest = runGarosApiSelfTest;
}
