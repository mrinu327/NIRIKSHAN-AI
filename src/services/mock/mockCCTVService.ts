/**
 * Mock CCTV Service (Foundation / Interface)
 * SIH26095 | MoSJE
 *
 * Designed for future real-time RTSP/HLS stream simulation and CV people counting.
 * No facial recognition or individual tracking is permitted under project safety rules.
 */

export interface CCTVStreamFeed {
  id: string;
  projectId: string;
  cameraName: string;
  status: 'Online' | 'Offline' | 'Intermittent';
  lastHeartbeat: string;
  currentEstimatedCount?: number;
  streamUrlPlaceholder: string;
}

export class MockCCTVService {
  async getProjectStreams(projectId: string): Promise<CCTVStreamFeed[]> {
    return [
      {
        id: `CAM-${projectId}-01`,
        projectId,
        cameraName: 'Main Entrance & Assembly',
        status: 'Online',
        lastHeartbeat: 'Just now',
        currentEstimatedCount: 25, // Single source of truth: 25 estimated vs 42 submitted
        streamUrlPlaceholder: 'mock://stream.mosje.gov.in/live/cam-01',
      },
    ];
  }

  async getOverallCCTVStatus(): Promise<{ online: number; total: number; offline: number }> {
    return {
      online: 139,
      total: 148,
      offline: 9,
    };
  }
}

export const mockCCTVService = new MockCCTVService();
