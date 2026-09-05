import { Request, Response } from 'express';
import { prisma } from '../index';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { riskLevel, state, district, scheme, search } = req.query;

    const where: any = {};

    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
      where.riskLevel = riskLevel;
    }
    if (state && typeof state === 'string') {
      where.state = { contains: state };
    }
    if (district && typeof district === 'string') {
      where.district = { contains: district };
    }
    if (scheme && typeof scheme === 'string') {
      where.scheme = { contains: scheme };
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { organization: { contains: search } },
        { district: { contains: search } },
        { state: { contains: search } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ riskScore: 'desc' }, { updatedAt: 'desc' }],
      include: {
        cameras: {
          select: {
            id: true,
            name: true,
            status: true,
            peopleCount: true,
          },
        },
        anomalies: {
          where: { status: 'OPEN' },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        cameras: true,
        attendances: {
          orderBy: { date: 'desc' },
          take: 7,
        },
        inspections: {
          orderBy: { assignedAt: 'desc' },
          include: {
            inspector: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
            evidence: true,
          },
        },
        anomalies: {
          orderBy: { createdAt: 'desc' },
        },
        videoCalls: {
          orderBy: { requestedAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: `Project ${id} not found` });
    }

    // Compute synthetic timeline
    const timeline = [
      ...project.attendances.map((att) => ({
        id: `tl-att-${att.id}`,
        type: 'ATTENDANCE_SUBMISSION',
        title: `Daily Attendance Submitted: ${att.reportedCount} Persons`,
        subtitle: att.observedCount ? `CCTV observed count: ~${att.observedCount}` : 'Standard entry',
        timestamp: att.date,
        badge: att.mismatchPercentage ? `${att.mismatchPercentage}% mismatch` : 'Verified',
        status: att.mismatchPercentage && att.mismatchPercentage > 20 ? 'WARNING' : 'SUCCESS',
      })),
      ...project.anomalies.map((anom) => ({
        id: `tl-anom-${anom.id}`,
        type: 'ANOMALY_FLAGGED',
        title: `AI Alert: ${anom.type.replace(/_/g, ' ')}`,
        subtitle: anom.explanation,
        timestamp: anom.createdAt,
        badge: `${anom.severity} (${anom.riskScore} pts)`,
        status: 'DANGER',
      })),
      ...project.inspections.map((insp) => ({
        id: `tl-insp-${insp.id}`,
        type: 'INSPECTION_ACTIVITY',
        title: `Inspection: ${insp.type.replace(/_/g, ' ')}`,
        subtitle: insp.reportNotes || 'Field verification assigned to PMU officer',
        timestamp: insp.completedAt || insp.startedAt || insp.assignedAt,
        badge: insp.status,
        status: insp.status === 'COMPLETED' ? 'SUCCESS' : 'INFO',
      })),
      ...project.videoCalls.map((vc) => ({
        id: `tl-vc-${vc.id}`,
        type: 'VIDEO_VERIFICATION',
        title: `Surprise VC: ${vc.participantName} (${vc.participantType})`,
        subtitle: vc.feedbackNotes || 'Direct citizen video verification',
        timestamp: vc.answeredAt || vc.requestedAt,
        badge: vc.result || vc.status,
        status: vc.result === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      ...project,
      timeline,
    });
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
};
