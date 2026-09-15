import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * GET /api/audit-logs
 * Retrieves immutable audit trail records for compliance and traceability
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { entityType, action, actorId, entityId, limit } = req.query;
    const where: any = {};

    if (entityType && typeof entityType === 'string' && entityType !== 'ALL') {
      where.entityType = entityType;
    }
    if (action && typeof action === 'string') {
      where.action = { contains: action };
    }
    if (actorId && typeof actorId === 'string') {
      where.actorId = actorId;
    }
    if (entityId && typeof entityId === 'string') {
      where.entityId = entityId;
    }

    const take = parseInt(limit as string, 10) || 50;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
      },
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

/**
 * POST /api/audit-logs
 * Appends a verified action to the central immutable audit log
 */
export const createAuditLog = async (req: Request, res: Response) => {
  try {
    const { actorId, action, entityType, entityId, metadata } = req.body;

    if (!actorId || !action || !entityType || !entityId) {
      return res.status(400).json({
        error: 'actorId, action, entityType, and entityId are required fields',
      });
    }

    const log = await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata || null,
        timestamp: new Date(),
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error recording audit log:', error);
    res.status(500).json({ error: 'Failed to record audit log' });
  }
};
