import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * POST /api/video-verification/request
 * Initiates a surprise video verification call request to an institute in-charge, staff, or beneficiary
 */
export const requestVerification = async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      participantType = 'BENEFICIARY',
      participantId,
      participantName,
      participantPhone,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: `Project ${projectId} not found` });
    }

    // Resolve participant details if not provided
    let pId = participantId;
    let pName = participantName;
    let pPhone = participantPhone;

    if (!pName || !pPhone) {
      if (participantType === 'INCHARGE') {
        const ngoUser = await prisma.user.findFirst({ where: { role: 'NGO' } });
        pId = pId || ngoUser?.id || 'usr-ngo-001';
        pName = pName || ngoUser?.name || `${project.organization} In-charge`;
        pPhone = pPhone || ngoUser?.phone || '+919876543212';
      } else if (participantType === 'STAFF') {
        pId = pId || 'usr-staff-01';
        pName = pName || 'On-Duty Duty Officer / Caregiver';
        pPhone = pPhone || '+919876543220';
      } else {
        const benUser = await prisma.user.findFirst({ where: { role: 'BENEFICIARY' } });
        pId = pId || benUser?.id || 'usr-beneficiary-001';
        pName = pName || benUser?.name || 'Ramesh Kumar (Beneficiary)';
        pPhone = pPhone || benUser?.phone || '+919876543213';
      }
    }

    const videoCall = await prisma.videoVerification.create({
      data: {
        projectId,
        participantType,
        participantId: pId || 'usr-participant-001',
        participantName: pName,
        participantPhone: pPhone,
        requestedAt: new Date(),
        status: 'REQUESTED',
      },
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

    // Record audit log
    const officialUser = await prisma.user.findFirst({ where: { role: 'OFFICIAL' } });
    await prisma.auditLog.create({
      data: {
        actorId: officialUser?.id || 'usr-official-001',
        action: 'INITIATED_SURPRISE_VIDEO_CALL',
        entityType: 'PROJECT',
        entityId: projectId,
        metadata: JSON.stringify({
          verificationId: videoCall.id,
          participantType,
          participantName: pName,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    res.status(201).json({
      success: true,
      message: `Surprise video verification initiated for ${pName} (${participantType})`,
      videoCall,
    });
  } catch (error) {
    console.error('Error requesting video verification:', error);
    res.status(500).json({ error: 'Failed to request video verification' });
  }
};

/**
 * POST /api/video-verification/:id/complete
 * Records the outcome, feedback notes, and citizen sentiment of a video verification call
 */
export const completeVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, result, feedbackNotes, sentiment } = req.body;

    const existing = await prisma.videoVerification.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: `Video verification ${id} not found` });
    }

    const callStatus = status || 'ANSWERED';
    const callResult = result || (callStatus === 'MISSED' ? 'UNREACHABLE' : 'VERIFIED');

    const updated = await prisma.videoVerification.update({
      where: { id },
      data: {
        status: callStatus,
        answeredAt: callStatus === 'MISSED' ? null : new Date(),
        result: callResult,
        feedbackNotes: feedbackNotes || null,
        sentiment: sentiment || null,
      },
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

    // Write to audit trail
    const officialUser = await prisma.user.findFirst({ where: { role: 'OFFICIAL' } });
    await prisma.auditLog.create({
      data: {
        actorId: officialUser?.id || 'usr-official-001',
        action: `COMPLETED_VIDEO_VERIFICATION_${callResult}`,
        entityType: 'PROJECT',
        entityId: updated.projectId,
        metadata: JSON.stringify({
          verificationId: id,
          status: callStatus,
          result: callResult,
          sentiment: sentiment || null,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    res.json({
      success: true,
      message: 'Video verification record updated successfully.',
      videoCall: updated,
    });
  } catch (error) {
    console.error('Error completing video verification:', error);
    res.status(500).json({ error: 'Failed to complete video verification' });
  }
};

/**
 * GET /api/video-verification/list
 * Retrieves history of surprise video verification inquiries
 */
export const listVerifications = async (req: Request, res: Response) => {
  try {
    const { projectId, status, result, participantType } = req.query;
    const where: any = {};

    if (projectId && typeof projectId === 'string') {
      where.projectId = projectId;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (result && typeof result === 'string' && result !== 'ALL') {
      where.result = result;
    }
    if (participantType && typeof participantType === 'string' && participantType !== 'ALL') {
      where.participantType = participantType;
    }

    const calls = await prisma.videoVerification.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
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

    res.json(calls);
  } catch (error) {
    console.error('Error listing video verifications:', error);
    res.status(500).json({ error: 'Failed to list video verifications' });
  }
};
