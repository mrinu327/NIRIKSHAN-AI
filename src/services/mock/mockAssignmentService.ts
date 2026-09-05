/**
 * Mock Assignment Service
 * SIH26095 | MoSJE
 *
 * Implements transparent, deterministic/random automated assignment
 * of surprise and routine field inspections across the PMU inspector pool.
 *
 * - Impartial uniform selection from active verified inspectors
 * - Clear explainability for auditability and transparency
 * - In-memory audit tracking
 */

import { DemoInspector, AssignmentAuditRecord, InspectionAssignment } from '../../types/inspection';
import { DEMO_INSPECTORS } from '../../data/mockData';
import { mockInspectionService } from './mockInspectionService';

export interface AutomatedAssignmentResult {
  inspectionId: string;
  selectedInspector: DemoInspector;
  eligibleInspectorsCount: number;
  auditRecord: AssignmentAuditRecord;
  updatedInspection: InspectionAssignment;
}

export class MockAssignmentService {
  private auditRecords: Map<string, AssignmentAuditRecord> = new Map();

  /**
   * Returns all inspectors with their active status for audit display
   */
  async getAllInspectors(): Promise<DemoInspector[]> {
    return [...DEMO_INSPECTORS];
  }

  /**
   * Returns only active, eligible inspectors available for assignment
   */
  async getEligibleInspectors(): Promise<DemoInspector[]> {
    return DEMO_INSPECTORS.filter((insp) => insp.active);
  }

  /**
   * Executes the automated random assignment workflow:
   * 1. Filters active eligible inspectors from the roster
   * 2. Selects an inspector using uniform random selection (preventing officer collusion)
   * 3. Generates transparent explainability metadata
   * 4. Updates the inspection record in memory to 'Assigned'
   * 5. Saves an audit record for MoSJE oversight review
   */
  async assignInspectorRandomly(inspectionId: string): Promise<AutomatedAssignmentResult> {
    const eligible = await this.getEligibleInspectors();
    if (eligible.length === 0) {
      throw new Error('No active eligible inspectors available in the PMU roster.');
    }

    // Uniform random selection among eligible officers
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const selectedInspector = eligible[randomIndex];

    const timestamp =
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' Today';

    const explanation = `${eligible.length} eligible active inspectors were available in the PMU field roster. The automated dispatch engine selected ${selectedInspector.name} (${selectedInspector.demoId}) uniformly at random to ensure impartial, surprise field verification.`;

    const auditRecord: AssignmentAuditRecord = {
      inspectionId,
      selectedInspectorId: selectedInspector.id,
      selectedInspectorName: selectedInspector.name,
      selectedInspectorDemoId: selectedInspector.demoId,
      assignmentTimestamp: timestamp,
      assignmentMethod: 'Automated Random Selection',
      eligibleInspectorCount: eligible.length,
      explanation,
    };

    this.auditRecords.set(inspectionId, auditRecord);

    // Update inspection record
    const updated = await mockInspectionService.updateInspectionAssignment(inspectionId, {
      status: 'Assigned',
      assignedOfficerId: selectedInspector.id,
      assignedOfficerName: selectedInspector.name,
      assignedOfficerDemoId: selectedInspector.demoId,
      assignmentMethod: 'Automated Random Selection',
      assignmentTimestamp: timestamp,
      eligibleInspectorsCount: eligible.length,
    });

    if (!updated) {
      throw new Error(`Inspection #${inspectionId} not found.`);
    }

    return {
      inspectionId,
      selectedInspector,
      eligibleInspectorsCount: eligible.length,
      auditRecord,
      updatedInspection: updated,
    };
  }

  /**
   * Retrieves the audit record for an automated assignment
   */
  async getAssignmentAudit(inspectionId: string): Promise<AssignmentAuditRecord | undefined> {
    return this.auditRecords.get(inspectionId);
  }

  /**
   * Field Inspector acknowledges the assigned inspection
   */
  async acknowledgeAssignment(
    inspectionId: string,
    officerId: string,
    officerName: string,
    officerDemoId?: string
  ): Promise<InspectionAssignment | undefined> {
    return mockInspectionService.acknowledgeInspection(
      inspectionId,
      officerId,
      officerName,
      officerDemoId
    );
  }
}

export const mockAssignmentService = new MockAssignmentService();
