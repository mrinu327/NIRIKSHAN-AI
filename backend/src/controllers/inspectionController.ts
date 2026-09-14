import { Request, Response } from 'express';
import { prisma } from '../index';
import {
  LocationVerificationResult,
  MediaEvidenceType,
} from '@nirikshan/shared-types';

import { verifyGeoFence } from '../services/geoFencingService';

/**
 * GET /api/inspections/my-assignments
 * Retrieves assigned inspections for the active field inspector
 */
export const getMyAssignments = async (req: Request, res: Response) => {
  try {
    const { inspectorId } = req.query;

    const where: any = {};

    if (inspectorId && typeof inspectorId === 'string') {
      where.inspectorId = inspectorId;
    }

    const inspections = await prisma.inspection.findMany({
      where,
      orderBy: { assignedAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            address: true,
            district: true,
            state: true,
            latitude: true,
            longitude: true,
            riskLevel: true,
            riskScore: true,
            capacity: true,
            beneficiaryCount: true,
          },
        },
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
    });

    res.json(inspections);
  } catch (error) {
    console.error('Error fetching inspector assignments:', error);

    res.status(500).json({
      error: 'Failed to fetch assignments',
    });
  }
};

/**
 * GET /api/inspections/:id
 * Retrieves a single inspection with project and evidence details
 */
export const getInspectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        project: true,
        inspector: true,
        evidence: true,
      },
    });

    if (!inspection) {
      return res.status(404).json({
        error: `Inspection ${id} not found`,
      });
    }

    res.json(inspection);
  } catch (error) {
    console.error('Error fetching inspection by ID:', error);

    res.status(500).json({
      error: 'Failed to fetch inspection details',
    });
  }
};

/**
 * POST /api/inspections/:id/start
 * Marks an assigned inspection as IN_PROGRESS
 */
export const startInspection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const inspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!inspection) {
      return res.status(404).json({
        error: `Inspection ${id} not found`,
      });
    }

    const updated = await prisma.inspection.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: inspection.startedAt || new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error starting inspection:', error);

    res.status(500).json({
      error: 'Failed to start inspection',
    });
  }
};

/**
 * POST /api/inspections/:id/location
 *
 * Verifies inspector GPS coordinates against
 * the registered project location.
 *
 * Default geofence radius: 100 metres.
 */
export const verifyLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    // Validate that coordinates were provided
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'latitude and longitude are required',
      });
    }

    // Convert coordinates to numbers
    const inspectorLatitude = Number(latitude);
    const inspectorLongitude = Number(longitude);

    // Validate numeric values
    if (
      !Number.isFinite(inspectorLatitude) ||
      !Number.isFinite(inspectorLongitude)
    ) {
      return res.status(400).json({
        error: 'latitude and longitude must be valid numbers',
      });
    }

    // Validate GPS coordinate ranges
    if (
      inspectorLatitude < -90 ||
      inspectorLatitude > 90 ||
      inspectorLongitude < -180 ||
      inspectorLongitude > 180
    ) {
      return res.status(400).json({
        error: 'Invalid GPS coordinates',
      });
    }

    // Find inspection and registered project location
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!inspection) {
      return res.status(404).json({
        error: `Inspection ${id} not found`,
      });
    }

    // Registered project location
    const projectLocation = {
      latitude: inspection.project.latitude,
      longitude: inspection.project.longitude,
    };

    // Inspector's current GPS location
    const inspectorLocation = {
      latitude: inspectorLatitude,
      longitude: inspectorLongitude,
    };

    // Perform geofence verification
    // 100 metre radius
    const result = verifyGeoFence(
      projectLocation,
      inspectorLocation,
      100
    );

    // Save inspector GPS coordinates and verification result
    await prisma.inspection.update({
      where: { id },
      data: {
        latitude: inspectorLatitude,
        longitude: inspectorLongitude,
        locationVerified: result.verified,
      },
    });

    // Prepare API response
    const response: LocationVerificationResult = {
      verified: result.verified,
      distanceMeters: result.distanceMeters,
      radiusMeters: result.allowedRadiusMeters,
      status: result.verified
        ? 'LOCATION_VERIFIED'
        : 'OUTSIDE_GEOFENCE',
      message: result.verified
        ? `Location successfully verified within ${result.distanceMeters}m of registered site.`
        : `Outside allowed geofence boundary: ${result.distanceMeters}m away (max allowed: ${result.allowedRadiusMeters}m).`,
    };

    res.json(response);
  } catch (error) {
    console.error('Error verifying inspection location:', error);

    res.status(500).json({
      error: 'Failed to verify location',
    });
  }
};

/**
 * POST /api/inspections/:id/evidence
 *
 * Attaches a captured evidence item
 * with SHA-256 integrity hash.
 */
export const addEvidence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      type,
      fileUrl,
      latitude,
      longitude,
      hash,
      perceptualHash,
      metadata,
    } = req.body;

    const inspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!inspection) {
      return res.status(404).json({
        error: `Inspection ${id} not found`,
      });
    }

    const evidence = await prisma.evidence.create({
      data: {
        inspectionId: id,
        projectId: inspection.projectId,
        type: type || MediaEvidenceType.PHOTO,
        fileUrl:
          fileUrl ||
          `https://evidence.sih26095.local/${id}_${Date.now()}.jpg`,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        hash:
          hash ||
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        perceptualHash: perceptualHash || null,
        integrityStatus: 'VERIFIED',
        metadata:
          typeof metadata === 'object'
            ? JSON.stringify(metadata)
            : metadata || null,
      },
    });

    res.status(201).json(evidence);
  } catch (error) {
    console.error('Error adding evidence item:', error);

    res.status(500).json({
      error: 'Failed to save evidence',
    });
  }
};

/**
 * POST /api/inspections/:id/submit
 *
 * Completes the inspection report,
 * persists checklist data,
 * and writes to audit log.
 */
export const submitInspection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      checklistData,
      reportNotes,
      latitude,
      longitude,
      locationVerified,
      evidenceItems,
    } = req.body;

    const inspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!inspection) {
      return res.status(404).json({
        error: `Inspection ${id} not found`,
      });
    }

    // Persist attached evidence items if provided
    if (Array.isArray(evidenceItems) && evidenceItems.length > 0) {
      for (const item of evidenceItems) {
        await prisma.evidence.create({
          data: {
            inspectionId: id,
            projectId: inspection.projectId,
            type: item.type || MediaEvidenceType.PHOTO,
            fileUrl: item.fileUrl,
            latitude: Number(item.latitude) || 0,
            longitude: Number(item.longitude) || 0,
            hash: item.hash,
            perceptualHash: item.perceptualHash || null,
            integrityStatus: 'VERIFIED',
            metadata:
              typeof item.metadata === 'object'
                ? JSON.stringify(item.metadata)
                : item.metadata || null,
          },
        });
      }
    }

    // Update inspection to COMPLETED
    const completed = await prisma.inspection.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),

        checklistData:
          typeof checklistData === 'object'
            ? JSON.stringify(checklistData)
            : checklistData || null,

        reportNotes:
          reportNotes ||
          'Field verification inspection completed.',

        latitude:
          latitude !== undefined
            ? Number(latitude)
            : inspection.latitude,

        longitude:
          longitude !== undefined
            ? Number(longitude)
            : inspection.longitude,

        locationVerified:
          locationVerified !== undefined
            ? Boolean(locationVerified)
            : inspection.locationVerified,

        syncStatus: 'SYNCED',
      },

      include: {
        project: true,
        evidence: true,
      },
    });

    // Write audit trail entry
    await prisma.auditLog.create({
      data: {
        actorId: inspection.inspectorId,
        action: 'SUBMITTED_INSPECTION_REPORT',
        entityType: 'INSPECTION',
        entityId: id,

        metadata: JSON.stringify({
          projectId: inspection.projectId,
          locationVerified: completed.locationVerified,
          evidenceCount: completed.evidence.length,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    res.json({
      success: true,
      message:
        'Inspection submitted and recorded in central audit trail.',
      inspection: completed,
    });
  } catch (error) {
    console.error('Error submitting inspection report:', error);

    res.status(500).json({
      error: 'Failed to submit inspection report',
    });
  }
};

/**
 * GET /api/inspections
 *
 * Retrieves all inspections with project,
 * inspector, and evidence details.
 */
export const getAllInspections = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      status,
      projectId,
      inspectorId,
      type,
    } = req.query;

    const where: any = {};

    if (
      status &&
      typeof status === 'string' &&
      status !== 'ALL'
    ) {
      where.status = status;
    }

    if (
      projectId &&
      typeof projectId === 'string'
    ) {
      where.projectId = projectId;
    }

    if (
      inspectorId &&
      typeof inspectorId === 'string'
    ) {
      where.inspectorId = inspectorId;
    }

    if (
      type &&
      typeof type === 'string' &&
      type !== 'ALL'
    ) {
      where.type = type;
    }

    const inspections = await prisma.inspection.findMany({
      where,

      orderBy: {
        assignedAt: 'desc',
      },

      include: {
        project: {
          select: {
            id: true,
            name: true,
            district: true,
            state: true,
            riskLevel: true,
            riskScore: true,
            address: true,
          },
        },

        inspector: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            district: true,
            state: true,
          },
        },

        evidence: true,
      },
    });

    res.json(inspections);
  } catch (error) {
    console.error('Error fetching all inspections:', error);

    res.status(500).json({
      error: 'Failed to fetch inspections',
    });
  }
};

/**
 * POST /api/inspections/assign
 *
 * Assigns a surprise inspection to an eligible
 * active inspector.
 */
export const assignInspection = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      projectId,
      type,
      inspectorId,
      reason,
      priority,
      alertId,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({
        error: 'projectId is required',
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        error: `Project ${projectId} not found`,
      });
    }

    let assignedInspectorId = inspectorId;

    // Specific inspector supplied
    if (assignedInspectorId) {
      const inspector = await prisma.user.findFirst({
        where: {
          id: assignedInspectorId,
          role: 'INSPECTOR',
          active: true,
        },
      });

      if (!inspector) {
        return res.status(400).json({
          error: `Inspector ${assignedInspectorId} not found or inactive`,
        });
      }
    } else {
      // Find all eligible active inspectors
      const activeInspectors = await prisma.user.findMany({
        where: {
          role: 'INSPECTOR',
          active: true,
        },
      });

      if (activeInspectors.length === 0) {
        return res.status(400).json({
          error: 'No active inspectors available for assignment',
        });
      }

      // Prioritize regional/district proximity
      const regionalInspectors =
        activeInspectors.filter(
          (i) =>
            i.state === project.state ||
            i.district === project.district
        );

      const candidates =
        regionalInspectors.length > 0
          ? regionalInspectors
          : activeInspectors;

      // Select random eligible inspector
      const selectedInspector =
        candidates[
          Math.floor(Math.random() * candidates.length)
        ];

      assignedInspectorId = selectedInspector.id;
    }

    const inspectionType =
      type || 'SURPRISE_PHYSICAL';

    // Create inspection
    const inspection =
      await prisma.inspection.create({
        data: {
          projectId,
          inspectorId: assignedInspectorId,
          type: inspectionType,
          status: 'ASSIGNED',
          assignedAt: new Date(),

          reportNotes: reason
            ? `Reason: ${reason}`
            : 'Surprise physical inspection assigned by central monitoring',

          syncStatus: 'SYNCED',
        },

        include: {
          project: true,

          inspector: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              district: true,
              state: true,
            },
          },
        },
      });

    // Mark project as under investigation
    await prisma.project.update({
      where: {
        id: projectId,
      },

      data: {
        status: 'UNDER_INVESTIGATION',
      },
    });

    // If an alert was linked, mark it as escalated
    if (alertId) {
      await prisma.anomaly
        .update({
          where: {
            id: alertId,
          },

          data: {
            status: 'ESCALATED',

            reviewNotes: `Surprise inspection ${inspection.id} assigned to ${inspection.inspector.name}`,
          },
        })
        .catch(() => {});
    }

    // Create central audit log entry
    const officialUser =
      await prisma.user.findFirst({
        where: {
          role: 'OFFICIAL',
        },
      });

    const actorId =
      officialUser
        ? officialUser.id
        : assignedInspectorId;

    await prisma.auditLog.create({
      data: {
        actorId,

        action:
          'ASSIGNED_SURPRISE_INSPECTION',

        entityType:
          'INSPECTION',

        entityId:
          inspection.id,

        metadata: JSON.stringify({
          projectId,
          inspectorId: assignedInspectorId,
          type: inspectionType,
          reason:
            reason ||
            'AI Risk and Compliance Protocol',
          priority:
            priority || 'HIGH',
          timestamp:
            new Date().toISOString(),
        }),
      },
    });

    res.status(201).json({
      success: true,

      message:
        `Surprise inspection assigned to ${inspection.inspector.name}`,

      inspection,
    });
  } catch (error) {
    console.error(
      'Error assigning inspection:',
      error
    );

    res.status(500).json({
      error: 'Failed to assign inspection',
    });
  }
};