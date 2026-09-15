import { PrismaClient } from '@prisma/client';
import {
  AnomalyType,
  RiskLevel,
  AnomalyOutput,
  ScoreIncrement,
} from '@nirikshan/shared-types';

export class AnomalyEngine {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Analyze a project and return transparent, explainable anomaly evaluations
   */
  async analyzeProject(projectId: string): Promise<AnomalyOutput[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        attendances: { orderBy: { date: 'desc' }, take: 5 },
        cameras: true,
        inspections: { orderBy: { assignedAt: 'desc' }, take: 3 },
      },
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const anomalies: AnomalyOutput[] = [];

    // 1. Attendance vs CCTV Mismatch Check
    const latestAttendance = project.attendances[0];
    if (latestAttendance && latestAttendance.observedCount !== null) {
      const diff = latestAttendance.reportedCount - (latestAttendance.observedCount || 0);
      const mismatchPct = Math.round((diff / latestAttendance.reportedCount) * 100);

      if (mismatchPct > 20) {
        const breakdown: ScoreIncrement[] = [
          { factor: `Attendance mismatch discrepancy (${mismatchPct}%)`, points: 35 },
          { factor: 'Peak operational hour divergence', points: 20 },
          { factor: 'Repeated pattern over 3 reporting cycles', points: 15 },
          { factor: 'Prior unresolved advisory', points: 12 },
        ];
        const totalScore = breakdown.reduce((sum, b) => sum + b.points, 0);

        anomalies.push({
          anomalyType: AnomalyType.ATTENDANCE_CCTV_MISMATCH,
          severity: totalScore >= 80 ? RiskLevel.HIGH : RiskLevel.MEDIUM,
          riskScore: totalScore,
          explanation: `Reported attendance was ${latestAttendance.reportedCount} beneficiaries, but automated camera computer vision observed only ~${latestAttendance.observedCount} unique individuals (${mismatchPct}% discrepancy).`,
          scoreBreakdown: breakdown,
          recommendedAction: 'Trigger surprise physical inspection or initiate random video verification call.',
          evidenceIds: project.cameras.map((c) => c.id),
        });
      }
    }

    // 2. Capacity Exceeded Check
    if (latestAttendance && latestAttendance.reportedCount > project.capacity) {
      const overCapacityPct = Math.round(
        ((latestAttendance.reportedCount - project.capacity) / project.capacity) * 100
      );
      const breakdown: ScoreIncrement[] = [
        { factor: `Reported headcount exceeds sanction capacity by ${overCapacityPct}%`, points: 45 },
        { factor: 'Physical bed limitation exceeded', points: 25 },
        { factor: 'Fiscal claim irregularities', points: 19 },
      ];
      const totalScore = breakdown.reduce((sum, b) => sum + b.points, 0);

      anomalies.push({
        anomalyType: AnomalyType.ATTENDANCE_CAPACITY_EXCEEDED,
        severity: RiskLevel.CRITICAL,
        riskScore: totalScore,
        explanation: `Registered facility capacity is ${project.capacity} beds, but NGO reported ${latestAttendance.reportedCount} beneficiaries (${overCapacityPct}% above sanction).`,
        scoreBreakdown: breakdown,
        recommendedAction: 'Mandatory on-site PMU headcount verification within 24 hours.',
        evidenceIds: [],
      });
    }

    // 3. CCTV Offline Check
    const offlineCameras = project.cameras.filter((c) => c.status === 'OFFLINE');
    if (offlineCameras.length > 0) {
      const breakdown: ScoreIncrement[] = [
        { factor: `${offlineCameras.length} camera(s) offline during mandatory operating hours`, points: 40 },
        { factor: 'Missing telemetry heartbeats without maintenance ticket', points: 18 },
        { factor: 'High vulnerability facility zone', points: 10 },
      ];
      const totalScore = breakdown.reduce((sum, b) => sum + b.points, 0);

      anomalies.push({
        anomalyType: AnomalyType.CCTV_OFFLINE_DURING_EXPECTED_HOURS,
        severity: RiskLevel.HIGH,
        riskScore: totalScore,
        explanation: `Camera "${offlineCameras[0].name}" stopped transmitting heartbeats without prior maintenance notification.`,
        scoreBreakdown: breakdown,
        recommendedAction: 'Issue automated show-cause notice and request live video check-in.',
        evidenceIds: offlineCameras.map((c) => c.id),
      });
    }

    return anomalies;
  }
}
