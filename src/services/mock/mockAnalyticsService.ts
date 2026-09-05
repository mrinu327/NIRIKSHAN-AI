/**
 * Mock Analytics Service (Foundation / Interface)
 * SIH26095 | MoSJE
 */

export class MockAnalyticsService {
  async getAttendanceTrends() {
    return [
      { day: 'Mon', averageAttendance: 88 },
      { day: 'Tue', averageAttendance: 91 },
      { day: 'Wed', averageAttendance: 86 },
      { day: 'Thu', averageAttendance: 89 },
      { day: 'Fri', averageAttendance: 84 },
    ];
  }

  async getAnomalyRate() {
    return {
      totalVerifications: 412,
      anomaliesDetected: 7,
      anomalyRatePercent: 1.7,
    };
  }
}

export const mockAnalyticsService = new MockAnalyticsService();
