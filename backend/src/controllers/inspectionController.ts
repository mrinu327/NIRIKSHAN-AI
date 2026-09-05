import { Request, Response } from 'express';
import { prisma } from '../index';
import {
  LocationVerificationResult,
  MediaEvidenceType,
} from '@nirikshan/shared-types';

/**
 * Calculates great-circle distance between two GPS points using Haversine formula in meters
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

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
    res.status(500).json({ error: 'Failed to fetch assignments' });
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
      return res.status(404).json({ error: `Inspection ${id} not found` });
    }

    res.json(inspection);
  } catch (error) {
    console.error('Error fetching inspection by ID:', error);
    res.status(500).json({ error: 'Failed to fetch inspection details' });
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
      return res.status(404).json({ error: `Inspection ${id} not found` });
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
    res.status(500).json({ error: 'Failed to start inspection' });
  }
};

/**
 * POST /api/inspections/:id/location
 * Validates inspector GPS coordinates against registered project coordinates.
 * Enforces strict 100m geofence radius.
 */
export const verifyLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!inspection) {
      return res.status(404).json({ error: `Inspection ${id} not found` });
    }

    const projectLat = inspection.project.latitude;
    const projectLon = inspection.project.longitude;

    const distanceMeters = calculateHaversineDistanceMeters(
      Number(latitude),
      Number(longitude),
      projectLat,
      projectLon
    );

    const radiusMeters = 100; // Strict 100 metre geofence requirement
    const verified = distanceMeters <= radiusMeters;

    // Update inspection with verification status
    await prisma.inspection.update({
      where: { id },
      data: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        locationVerified: verified,
      },
    });

    const result: LocationVerificationResult = {
      verified,
      distanceMeters,
      radiusMeters,
      status: verified ? 'LOCATION_VERIFIED' : 'OUTSIDE_GEOFENCE',
      message: verified
        ? `Location successfully verified within ${distanceMeters}m of registered site.`
        : `Outside allowed geofence boundary: ${distanceMeters}m away (max allowed: ${radiusMeters}m).`,
    };

    res.json(result);
  } catch (error) {
    console.error('Error verifying inspection location:', error);
    res.status(500).json({ error: 'Failed to verify location' });
  }
};

/**
 * POST /api/inspections/:id/evidence
 * Attaches a captured evidence item with SHA-256 integrity hash
 */
export const addEvidence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, fileUrl, latitude, longitude, hash, perceptualHash, metadata } = req.body;

    const inspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!inspection) {
      return res.status(404).json({ error: `Inspection ${id} not found` });
    }

    const evidence = await prisma.evidence.create({
      data: {
        inspectionId: id,
        projectId: inspection.projectId,
        type: type || MediaEvidenceType.PHOTO,
        fileUrl: fileUrl || `https://evidence.sih26095.local/${id}_${Date.now()}.jpg`,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        hash: hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        perceptualHash: perceptualHash || null,
        integrityStatus: 'VERIFIED',
        metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata || null,
      },
    });

    res.status(201).json(evidence);
  } catch (error) {
    console.error('Error adding evidence item:', error);
    res.status(500).json({ error: 'Failed to save evidence' });
  }
};

/**
 * POST /api/inspections/:id/submit
 * Completes the inspection report, persists checklist data, and writes to audit log
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
      return res.status(404).json({ error: `Inspection ${id} not found` });
    }

    // Persist attached evidence items if provided in payload
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
            metadata: typeof item.metadata === 'object' ? JSON.stringify(item.metadata) : item.metadata || null,
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
        reportNotes: reportNotes || 'Field verification inspection completed.',
        latitude: latitude !== undefined ? Number(latitude) : inspection.latitude,
        longitude: longitude !== undefined ? Number(longitude) : inspection.longitude,
        locationVerified: locationVerified !== undefined ? Boolean(locationVerified) : inspection.locationVerified,
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
      message: 'Inspection submitted and recorded in central audit trail.',
      inspection: completed,
    });
  } catch (error) {
    console.error('Error submitting inspection report:', error);
    res.status(500).json({ error: 'Failed to submit inspection report' });
  }
};
