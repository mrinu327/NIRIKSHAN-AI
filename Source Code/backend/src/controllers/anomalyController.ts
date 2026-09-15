import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAnomalies = async (req: Request, res: Response) => {
  try {
    const { severity, status, projectId } = req.query;
    const where: any = {};

    if (severity && typeof severity === 'string' && severity !== 'ALL') {
      where.severity = severity;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (projectId && typeof projectId === 'string') {
      where.projectId = projectId;
    }

    const anomalies = await prisma.anomaly.findMany({
      where,
      orderBy: [{ riskScore: 'desc' }, { createdAt: 'desc' }],
      include: {
        project: {
          select: {
            id: true,
            name: true,
            district: true,
            state: true,
            riskLevel: true,
          },
        },
      },
    });

    res.json(anomalies);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
};

export const reviewAnomaly = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, reviewNotes } = req.body;

    const updated = await prisma.anomaly.update({
      where: { id },
      data: {
        status: status || 'REVIEWED',
        reviewedBy: reviewedBy || 'Authorized Official',
        reviewNotes: reviewNotes || 'Human official review recorded',
      },
    });

    // Log this action to the audit trail
    const officialUser = await prisma.user.findFirst({ where: { role: 'OFFICIAL' } });
    if (officialUser) {
      await prisma.auditLog.create({
        data: {
          actorId: officialUser.id,
          action: `REVIEWED_ANOMALY_${status || 'REVIEWED'}`,
          entityType: 'ANOMALY',
          entityId: id,
          metadata: JSON.stringify({ reviewNotes, reviewedBy }),
        },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error reviewing anomaly:', error);
    res.status(500).json({ error: 'Failed to review anomaly' });
  }
};
