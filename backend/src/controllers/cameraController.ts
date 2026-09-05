import { Request, Response } from 'express';
import { prisma } from '../index';
import { MockCCTVProvider } from '../services/cctv/CCTVService';

const cctvProvider = new MockCCTVProvider(prisma);

export const getCameras = async (req: Request, res: Response) => {
  try {
    const { projectId, status } = req.query;
    const where: any = {};

    if (projectId && typeof projectId === 'string') {
      where.projectId = projectId;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    const cameras = await prisma.camera.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            district: true,
            state: true,
          },
        },
      },
    });

    res.json(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    res.status(500).json({ error: 'Failed to fetch cameras' });
  }
};

export const getCameraHealth = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const health = await cctvProvider.getHealth(id);
    res.json(health);
  } catch (error) {
    console.error('Error fetching camera health:', error);
    res.status(404).json({ error: 'Camera health check failed' });
  }
};
