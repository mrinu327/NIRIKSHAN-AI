import { PrismaClient } from '@prisma/client';
import { CameraStatus, CameraHealth, PeopleCountEstimate, CCTVProvider } from '@nirikshan/shared-types';

export class MockCCTVProvider implements CCTVProvider {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getStreamUrl(cameraId: string): Promise<string> {
    const camera = await this.prisma.camera.findUnique({ where: { id: cameraId } });
    if (!camera) {
      throw new Error(`Camera with ID ${cameraId} not found`);
    }
    return camera.streamUrl;
  }

  async getHealth(cameraId: string): Promise<CameraHealth> {
    const camera = await this.prisma.camera.findUnique({ where: { id: cameraId } });
    if (!camera) {
      throw new Error(`Camera with ID ${cameraId} not found`);
    }

    const lastHeartbeat = new Date(camera.lastHeartbeat);
    const diffMs = Date.now() - lastHeartbeat.getTime();

    let status = CameraStatus.ONLINE;
    if (diffMs > 2 * 60 * 60 * 1000) {
      status = CameraStatus.OFFLINE;
    } else if (diffMs > 10 * 60 * 1000) {
      status = CameraStatus.DELAYED;
    }

    return {
      status,
      lastHeartbeat,
      latencyMs: status === CameraStatus.ONLINE ? Math.floor(Math.random() * 80 + 20) : 9999,
    };
  }

  async getPeopleCountEstimate(cameraId: string): Promise<PeopleCountEstimate> {
    const camera = await this.prisma.camera.findUnique({ where: { id: cameraId } });
    if (!camera) {
      throw new Error(`Camera with ID ${cameraId} not found`);
    }

    return {
      count: camera.peopleCount,
      confidence: camera.status === 'ONLINE' ? 0.94 : 0.0,
      detectedAt: new Date(camera.lastHeartbeat),
    };
  }
}
