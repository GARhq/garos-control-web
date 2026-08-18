import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const GAR_BIN = "/home/rocha/Proyectos/garos-dev/gar/target/debug/gar";

export class GarAdapter {
  static async execute(args: string[]): Promise<any> {
    try {
      const { stdout } = await execFileAsync(GAR_BIN, args);
      if (args.includes('--json')) {
        try {
          return JSON.parse(stdout);
        } catch (e) {
          return stdout;
        }
      }
      return stdout;
    } catch (error) {
      console.error(`[GarAdapter] Error executing gar with args ${args.join(' ')}:`, error);
      throw error;
    }
  }

  // --- Devices (Clients) ---
  static async getDevices() { return this.execute(['client', 'list', '--json']); }
  static async wakeDevice(mac: string) { return this.execute(['client', 'wake', mac, '--json']); }
  static async rebootDevice(mac: string) { return this.execute(['client', 'reboot', mac, '--json']); }
  static async shutdownDevice(mac: string) { return this.execute(['client', 'shutdown', mac, '--json']); }
  static async setDeviceImage(mac: string, imageId: string) { return this.execute(['client', 'set-image', mac, imageId, '--json']); }
  static async sendMessage(mac: string, message: string) { return this.execute(['client', 'message', mac, message, '--json']); }
  static async sessionDoctor() { return this.execute(['client', 'session-doctor', '--json']); }

  // --- Images ---
  static async getImages() { return this.execute(['image', 'list', '--json']); }
  static async buildImage(name: string, kernel: string, args: string) { 
    return this.execute(['image', 'build', '--name', name, '--kernel', kernel, '--args', args, '--json']); 
  }

  // --- Sessions ---
  static async getSessions() { return this.execute(['session', 'list', '--json']); }
  static async killSession(id: string) { return this.execute(['session', 'kill', id, '--json']); }

  // --- Services & System ---
  static async getServices() { return this.execute(['service', 'list', '--json']); }
  static async serviceAction(name: string, action: string) { return this.execute(['service', action, name, '--json']); }
  static async getStatus() { return this.execute(['status', '--json']); }
  static async getLogs() { return this.execute(['logs', '--json']); }
}
