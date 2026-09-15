/**
 * Types barrel export
 */

export * from './role';
export type {
  ProjectStatus,
  PriorityLevel,
  CCTVStatus,
  ProjectStatsSummary,
  Project as LegacyProject,
} from './project';
export * from './alert';
export type {
  InspectionType,
  ChecklistStatus,
  ChecklistCategory,
  ChecklistItem,
  InspectionFindings,
  MockEvidenceItem,
  InspectionAssignment,
  DemoInspector,
  AssignmentAuditRecord,
  InspectionStatus as LegacyInspectionStatus,
} from './inspection';
export * from './attendance';
export * from './navigation';
export * from './master';
export * from '@nirikshan/shared-types';


