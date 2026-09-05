import { Request, Response } from 'express';
import { prisma } from '../index';
import { DashboardSummary, RiskLevel } from '@nirikshan/shared-types';

export const getDashboardSummary = async (_req: Request, res: Response) => {
  try {
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({
      where: { status: { not: 'INACTIVE' } },
    });
    const projectsUnderInspection = await prisma.project.count({
      where: { status: 'UNDER_INVESTIGATION' },
    });
    const openAlerts = await prisma.anomaly.count({
      where: { status: 'OPEN' },
    });
    const highRiskProjects = await prisma.project.count({
      where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } },
    });
    const camerasOnline = await prisma.camera.count({
      where: { status: 'ONLINE' },
    });
    const camerasOffline = await prisma.camera.count({
      where: { status: 'OFFLINE' },
    });
    const pendingVerifications = await prisma.videoVerification.count({
      where: { status: 'REQUESTED' },
    });

    const summary: DashboardSummary = {
      totalProjects,
      activeProjects,
      projectsUnderInspection,
      openAlerts,
      highRiskProjects,
      camerasOnline,
      camerasOffline,
      pendingVerifications,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};

export const getRiskDistribution = async (_req: Request, res: Response) => {
  try {
    const low = await prisma.project.count({ where: { riskLevel: 'LOW' } });
    const medium = await prisma.project.count({ where: { riskLevel: 'MEDIUM' } });
    const high = await prisma.project.count({ where: { riskLevel: 'HIGH' } });
    const critical = await prisma.project.count({ where: { riskLevel: 'CRITICAL' } });

    res.json({
      [RiskLevel.LOW]: low,
      [RiskLevel.MEDIUM]: medium,
      [RiskLevel.HIGH]: high,
      [RiskLevel.CRITICAL]: critical,
      total: low + medium + high + critical,
    });
  } catch (error) {
    console.error('Error fetching risk distribution:', error);
    res.status(500).json({ error: 'Failed to fetch risk distribution' });
  }
};

export const getDashboardAlerts = async (_req: Request, res: Response) => {
  try {
    const alerts = await prisma.anomaly.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching dashboard alerts:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard alerts' });
  }
};
