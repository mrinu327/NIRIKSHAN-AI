/**
 * Mock Assignment Service (Foundation / Interface)
 * SIH26095 | MoSJE
 *
 * For the Surprise Inspection Workflow:
 * Select institute/project -> check priority -> randomly assign eligible inspector -> notify inspector.
 */

import { InspectionAssignment } from '../../types/inspection';

export class MockAssignmentService {
  async triggerSurpriseInspection(projectId: string, reason: string): Promise<{ success: boolean; assignmentId: string }> {
    return {
      success: true,
      assignmentId: `SURPRISE-INSP-${Date.now().toString().slice(-4)}`,
    };
  }

  async getEligibleInspectors(location: string): Promise<Array<{ id: string; name: string; distanceKm: number }>> {
    return [
      { id: 'USR-INSP-DEMO-A', name: 'Demo Field Inspector A', distanceKm: 4.2 },
      { id: 'USR-INSP-DEMO-B', name: 'Demo Field Inspector B', distanceKm: 8.7 },
    ];
  }
}

export const mockAssignmentService = new MockAssignmentService();
