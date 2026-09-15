import { Request, Response } from 'express';
import { prisma } from '../index';
import { AnomalyEngine } from '../services/ai/AnomalyEngine';

const anomalyEngine = new AnomalyEngine(prisma);

/**
 * POST /api/attendance
 * Records daily attendance submission for a project and triggers AI anomaly engine
 */
export const submitAttendance = async (req: Request, res: Response) => {
  try {
    const { projectId, reportedCount, staffCount, mealCount, date, source, submittedBy } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    if (reportedCount === undefined || isNaN(Number(reportedCount))) {
      return res.status(400).json({ error: 'reportedCount must be a valid number' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { cameras: true },
    });

    if (!project) {
      return res.status(404).json({ error: `Project ${projectId} not found` });
    }

    // Determine observed count from online project cameras
    const onlineCameras = project.cameras.filter((c) => c.status === 'ONLINE');
    const observedCount =
      onlineCameras.length > 0
        ? onlineCameras.reduce((sum, c) => sum + c.peopleCount, 0)
        : null;

    let mismatchPercentage: number | null = null;
    const numReported = Number(reportedCount);
    if (observedCount !== null && numReported > 0) {
      const diff = numReported - observedCount;
      mismatchPercentage = Math.round((diff / numReported) * 100);
    }

    // Persist attendance record
    const attendance = await prisma.attendance.create({
      data: {
        projectId,
        date: date ? new Date(date) : new Date(),
        reportedCount: numReported,
        observedCount,
        source: source || 'PORTAL_SUBMISSION',
        mismatchPercentage,
      },
    });

    // Optionally update project staff count if provided
    if (staffCount !== undefined && !isNaN(Number(staffCount))) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          staffCount: Number(staffCount),
          beneficiaryCount: numReported,
        },
      });
    }

    // Trigger AnomalyEngine evaluation
    const detectedAnomalies = await anomalyEngine.analyzeProject(projectId);

    // Synchronize detected anomalies into database
    for (const anomaly of detectedAnomalies) {
      const existingOpen = await prisma.anomaly.findFirst({
        where: {
          projectId,
          type: anomaly.anomalyType,
          status: 'OPEN',
        },
      });

      if (existingOpen) {
        await prisma.anomaly.update({
          where: { id: existingOpen.id },
          data: {
            severity: anomaly.severity,
            riskScore: anomaly.riskScore,
            scoreBreakdown: JSON.stringify(anomaly.scoreBreakdown),
            explanation: anomaly.explanation,
            evidenceIds: JSON.stringify(anomaly.evidenceIds),
          },
        });
      } else {
        await prisma.anomaly.create({
          data: {
            projectId,
            type: anomaly.anomalyType,
            severity: anomaly.severity,
            riskScore: anomaly.riskScore,
            scoreBreakdown: JSON.stringify(anomaly.scoreBreakdown),
            explanation: anomaly.explanation,
            evidenceIds: JSON.stringify(anomaly.evidenceIds),
            status: 'OPEN',
          },
        });
      }
    }

    // Recalculate project overall risk level based on all open anomalies
    const openAnomalies = await prisma.anomaly.findMany({
      where: { projectId, status: 'OPEN' },
    });

    if (openAnomalies.length > 0) {
      const maxScore = Math.min(100, Math.max(...openAnomalies.map((a) => a.riskScore)));
      let riskLevel = 'LOW';
      if (maxScore >= 80) riskLevel = 'CRITICAL';
      else if (maxScore >= 60) riskLevel = 'HIGH';
      else if (maxScore >= 35) riskLevel = 'MEDIUM';

      await prisma.project.update({
        where: { id: projectId },
        data: { riskScore: maxScore, riskLevel },
      });
    }

    // Record audit log
    const ngoUser = await prisma.user.findFirst({ where: { role: 'NGO' } });
    const actorId = submittedBy || ngoUser?.id || 'usr-ngo-001';

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'SUBMITTED_DAILY_ATTENDANCE',
        entityType: 'PROJECT',
        entityId: projectId,
        metadata: JSON.stringify({
          attendanceId: attendance.id,
          reportedCount: numReported,
          observedCount,
          mismatchPercentage,
          mealCount: mealCount || null,
          anomaliesDetectedCount: detectedAnomalies.length,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Daily attendance recorded and verified against computer vision telemetry.',
      attendance,
      anomaliesDetected: detectedAnomalies,
    });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ error: 'Failed to submit attendance' });
  }
};

/**
 * GET /api/attendance/:projectId
 * Fetches attendance submission records for a specific project
 */
export const getProjectAttendance = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 14;

    const attendances = await prisma.attendance.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    res.json(attendances);
  } catch (error) {
    console.error('Error fetching project attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
};
