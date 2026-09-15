/**
 * NIRIKSHAN AI — Master Data Architecture Models
 * MoSJE Centralized Monitoring & Inspection System
 * 
 * Defines the 21 master logical entities, relationships, data source metadata,
 * privacy guards, and search/filter criteria.
 */

// ==========================================
// 1. DATA SOURCE METADATA & PRIVACY
// ==========================================

export type DataSourceType = 'OFFICIAL' | 'API' | 'PUBLIC' | 'DEMO' | 'SIMULATED';
export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'DEMO';

export interface DataSourceMetadata {
  type: DataSourceType;
  sourceName?: string;
  sourceUrl?: string;
  lastUpdated?: string;
  verificationStatus: VerificationStatus;
  notes?: string;
  capturedAt?: string;
  syncStatus?: string;
}

// ==========================================
// 2. ADMINISTRATIVE & SCHEME ENTITIES
// ==========================================

export interface Division {
  divisionId: string;
  name: string;
  shortName?: string;
  code?: string;
  description?: string;
  responsibleUnit?: string;
  active: boolean;

  schemeIds: string[];
  projectIds: string[];
  organizationIds: string[];

  performanceSummary?: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    highPriorityProjects: number;
    anomalyCount: number;
  };

  monitoringSummary?: {
    activeProjects: number;
    highPriorityProjects: number;
    criticalProjects: number;
    anomalyCount: number;
    inspectionsDue: number;
    inspectionsCompleted: number;
  };

  financialSummary?: {
    sanctionedAmount: number;
    releasedAmount: number;
    utilizedAmount: number;
    utilizationPercentage: number;
  };

  dataSource: DataSourceMetadata;
}

export type SchemeStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type MonitoringPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SchemeCategory =
  | 'Social Empowerment'
  | 'Economic Empowerment'
  | 'Educational Empowerment'
  | 'Social Defence'
  | 'Senior Citizen Welfare'
  | 'Scheduled Caste Welfare'
  | 'Backward Classes Welfare'
  | 'Disability-related Programmes'
  | 'Other Programmes';

export interface Scheme {
  schemeId: string;
  name: string;
  shortName?: string;
  code?: string;
  divisionId: string;

  description?: string;
  status: SchemeStatus;
  category?: SchemeCategory | string;

  targetBeneficiaries?: string;
  implementationModel?: string;
  fundingModel?: string;
  sourceUrl?: string;
  lastVerifiedDate?: string;

  implementingOrganizationIds: string[];
  projectIds: string[];

  totalBudgetCr?: number;

  financialSummary?: {
    sanctionedAmount: number;
    releasedAmount: number;
    utilizedAmount: number;
    utilizationPercentage: number;
    allocatedCr?: number;
    releasedCr?: number;
    utilizedCr?: number;
  };

  performanceSummary?: {
    target: number;
    achieved: number;
    achievementPercentage: number;
  };

  anomalyCount: number;
  monitoringPriority: MonitoringPriority;

  inspectionSummary?: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };

  organizationSummary?: {
    totalOrganizations: number;
    activeOrganizations: number;
  };

  stateCoverage?: Array<{
    stateId: string;
    stateName?: string;
    projectCount: number;
  }>;

  dataSource: DataSourceMetadata;
}

export interface DivisionPerformanceMetrics {
  divisionId: string;
  name: string;
  code?: string;
  totalSchemes: number;
  activeSchemes: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalOrganizations: number;
  totalInspections: number;
  completedInspections: number;
  pendingInspections: number;
  overdueInspections: number;
  totalAnomalies: number;
  highSeverityAnomalies: number;
  totalSanctionedCr: number;
  totalReleasedCr: number;
  totalUtilizedCr: number;
  totalUnspentCr: number;
  utilizationPercentage: number;
  averageProjectProgress: number;
  averageComplianceScore: number;
  averageRiskScore: number;
  monitoringPriority: MonitoringPriority;
}

export interface SchemePerformanceMetrics {
  schemeId: string;
  name: string;
  shortName?: string;
  divisionId: string;
  divisionName?: string;
  projectCount: number;
  activeProjectCount: number;
  completedProjectCount: number;
  organizationCount: number;
  sanctionedFunding: number;
  releasedFunding: number;
  utilizedFunding: number;
  unspentAmount: number;
  utilizationPercentage: number;
  beneficiaryTarget: number;
  beneficiaryEnrolled: number;
  beneficiaryReported: number;
  beneficiaryVerified: number;
  inspectionCount: number;
  completedInspectionCount: number;
  pendingInspectionCount: number;
  overdueInspectionCount: number;
  anomalyCount: number;
  highSeverityAnomalyCount: number;
  averageProjectProgress: number;
  averageCompliance: number;
  averageRiskScore: number;
  monitoringPriority: MonitoringPriority;
}

// ==========================================
// 3. PMU & INSPECTION TEAM ENTITIES
// ==========================================

export interface PMU {
  pmuId: string;
  name: string;
  divisionId?: string;
  description?: string;

  teamIds: string[];
  statesCovered: string[];
  districtsCovered: string[];

  responsibilities: string[];
  active: boolean;

  dataSource: DataSourceMetadata;
}

export interface PMUTeam {
  teamId: string;
  pmuId: string;
  teamName: string;

  roles: string[];
  responsibilities: string[];

  statesCovered: string[];
  districtsCovered: string[];

  activeMembers: number;

  projectIds: string[];
  inspectionIds: string[];

  dataSource: DataSourceMetadata;
}

// ==========================================
// 4. GEOGRAPHICAL MASTER DATA
// ==========================================

export interface State {
  stateId: string;
  name: string;
  code?: string;
  districtIds: string[];
  active: boolean;
}

export interface District {
  districtId: string;
  name: string;
  stateId: string;
  code?: string;
  active: boolean;
}

// ==========================================
// 5. ORGANIZATION & IMPLEMENTING AGENCY
// ==========================================

export type OrganizationType =
  | 'NGO'
  | 'TRUST'
  | 'SOCIETY'
  | 'INSTITUTION'
  | 'TRAINING_INSTITUTION'
  | 'GOVERNMENT_AGENCY'
  | 'IMPLEMENTING_AGENCY'
  | 'OTHER_PARTNER';

export type OrganizationStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'UNKNOWN';

export interface OrganizationComplianceSummary {
  complianceScore: number;
  documentationScore: number;
  inspectionScore: number;
  beneficiaryVerificationScore: number;
}

export interface OrganizationContactSummary {
  emailMasked?: string;
  phoneMasked?: string;
  officialDesignation?: string;
}

export interface OrganizationFundingSummary {
  totalSanctioned: number;
  totalReleased: number;
  totalUtilized: number;
  unspentAmount: number;
  utilizationPercentage: number;
}

export interface OrganizationInspectionSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface OrganizationRiskFactorItem {
  rawScore: number;
  weight: number;
  weightedScore: number;
  description: string;
}

export interface OrganizationRiskProfile {
  organizationId: string;
  score: number;
  band: 'Low Monitoring Concern' | 'Moderate Monitoring Concern' | 'Higher Monitoring Priority' | 'Critical Review Priority';
  monitoringPriority: MonitoringPriority;
  factorBreakdown: {
    inspectionPerformance: OrganizationRiskFactorItem;
    compliance: OrganizationRiskFactorItem;
    financialUtilization: OrganizationRiskFactorItem;
    projectOutcomes: OrganizationRiskFactorItem;
    documentation: OrganizationRiskFactorItem;
    beneficiaryVerification: OrganizationRiskFactorItem;
    historicalAnomalies: OrganizationRiskFactorItem;
  };
  positiveFactors: string[];
  attentionFactors: string[];
  anomalies: MasterAnomaly[];
  trend: { label: string; value: number; date?: string; }[];
  trendUnavailable?: boolean;
  trendNote?: string;
  recommendedActions: string[];
  calculatedAt: string;
}

export interface OrganizationPerformanceSummary {
  organizationId: string;
  organizationName: string;
  organizationType: string;
  registrationStatus: string;
  state: string;
  district: string;

  projectCount: number;
  activeProjectCount: number;
  completedProjectCount: number;

  totalSanctioned: number;
  totalReleased: number;
  totalUtilized: number;
  totalUnspent: number;
  utilizationRate: number;

  beneficiaryTarget: number;
  beneficiaryEnrolled: number;
  beneficiaryVerified: number;
  attendanceRate: number;

  inspectionCount: number;
  completedInspectionCount: number;
  pendingInspectionCount: number;
  openFindingCount: number;
  resolvedFindingCount: number;

  anomalyCount: number;
  criticalAnomalyCount: number;
  highAnomalyCount: number;
  documentationGapCount: number;

  performanceScore: number;
  monitoringPriority: MonitoringPriority | string;
  scoreBand: string;
  trend: Array<{ label: string; value: number; date?: string }> | string;
  trendUnavailable?: boolean;
  trendNote?: string;

  dataSource: DataSourceMetadata;
  lastUpdated: string;
}

export interface OrganizationScoreExplanation {
  overallScore: number;
  scoreBand: string;
  strongestFactors: string[];
  weakerFactors: string[];
  positiveContributors: string[];
  negativeContributors: string[];
  observedAnomalies: MasterAnomaly[];
  dataLimitations: string[];
  recommendedMonitoringActions: string[];
}

export interface OrganizationBeneficiarySummary {
  target: number;
  enrolled: number;
  verified: number;
  attendance: number;
  coverageRate: number;
  verificationRate: number;
}

export interface OrganizationRankingCriteria {
  sortBy?: 'score' | 'priority' | 'utilization' | 'beneficiaryVerification' | 'openFindings' | 'anomalies' | string;
  direction?: 'asc' | 'desc';
}

export interface OrganizationFilterCriteria {
  search?: string;
  type?: OrganizationType | 'ALL';
  monitoringPriority?: MonitoringPriority | 'ALL';
  registrationStatus?: OrganizationStatus | 'ALL';
  stateId?: string;
  districtId?: string;
  schemeId?: string;
}

export interface Organization {
  organizationId: string;
  name: string;
  organizationType: OrganizationType;
  type?: OrganizationType | string; // Compatibility alias

  registrationNumber?: string;
  ngoDarpanId?: string;
  panMasked?: string; // Formatted as "XXXXXX1234" — never full PAN

  registrationStatus: OrganizationStatus;

  stateId?: string;
  districtId?: string;
  address?: string;

  contactSummary?: OrganizationContactSummary;
  establishedYear?: number;

  schemeIds: string[];
  projectIds: string[];

  totalSanctionedAmount: number;
  totalReleasedAmount: number;
  totalUtilizedAmount: number;
  fundingSummary?: OrganizationFundingSummary;

  inspectionIds: string[];
  inspectionSummary?: OrganizationInspectionSummary;
  findingIds: string[];
  anomalyIds: string[];
  anomalyCount?: number;

  complianceSummary?: OrganizationComplianceSummary;
  complianceScore?: number;
  riskScore?: number;
  monitoringPriority?: MonitoringPriority;

  lastInspectionDate?: string;
  nextInspectionDate?: string;

  createdAt: string;
  updatedAt: string;

  dataSource: DataSourceMetadata;
}

// ==========================================
// 6. MASTER PROJECT ENTITY
// ==========================================

export type ProjectOperationalStatus =
  | 'PROPOSED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'CLOSED';

export type MasterPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MasterRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProjectLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'DEMO' | 'DEVICE' | 'API';
  city?: string;
  district?: string;
  state?: string;
  address?: string;
}

export interface MasterProject {
  projectId: string;
  name: string;
  code?: string;
  projectCode?: string;

  schemeId: string;
  divisionId?: string;
  organizationId: string;

  stateId?: string;
  districtId?: string;

  location?: ProjectLocation;

  projectStatus: ProjectOperationalStatus;
  priority: MasterPriority;

  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;

  sanctionedAmount: number;
  releasedAmount: number;
  utilizedAmount: number;

  beneficiaryTarget?: number;
  beneficiaryReported?: number;
  beneficiaryVerified?: number;

  progressPercentage?: number;

  inspectionIds: string[];
  anomalyIds: string[];

  riskScore?: number;
  monitoringPriority?: MonitoringPriority;

  unspentAmount?: number;
  utilizationPercentage?: number;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  findingsCount?: number;
  anomalyCount?: number;
  outcomeSummary?: {
    completionIndicator: string;
    beneficiaryReachIndicator: string;
    inspectionIndicator: string;
    notes?: string;
  };

  dataSource: DataSourceMetadata;

  // Backward-compatibility properties with existing Project interface
  id: string; // mirrors projectId
  category?: string;
  cctvStatus?: 'Online' | 'Offline' | 'Intermittent' | 'Discrepancy Detected';
  complianceScore?: number;
  status?: string;
  attendance?: {
    present: number;
    capacity: number;
    submittedAt?: string;
    status: 'Submitted' | 'Pending' | 'Flagged' | 'Verified';
  };
  notes?: string;
}

// ==========================================
// 6B. PROJECT MONITORING & INTELLIGENCE TYPES
// ==========================================

export interface ProjectMonitoringIndicator {
  label: string;
  value: string | number;
  status: 'NORMAL' | 'ATTENTION' | 'CRITICAL';
  reason: string;
}

export interface ProjectMonitoringFactorItem {
  rawScore: number;
  weight: number;
  weightedScore: number;
  description: string;
}

export interface ProjectMonitoringProfile {
  projectId: string;
  score: number;
  priority: MonitoringPriority;
  band: 'Low Monitoring Concern' | 'Moderate Monitoring Concern' | 'Higher Monitoring Priority' | 'Critical Review Priority';
  factorBreakdown: {
    projectCompletion: ProjectMonitoringFactorItem;
    statutoryCompliance: ProjectMonitoringFactorItem;
    financialUtilization: ProjectMonitoringFactorItem;
    beneficiaryCoverage: ProjectMonitoringFactorItem;
    inspectionStatus: ProjectMonitoringFactorItem;
    observedAnomalies: ProjectMonitoringFactorItem;
    documentation: ProjectMonitoringFactorItem;
  };
  positiveIndicators: string[];
  attentionIndicators: string[];
  recommendedActions: string[];
  monitoringIndicators: ProjectMonitoringIndicator[];
  calculatedAt: string;
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'DELAYED' | 'INSPECTION_DUE' | 'UNDER_REVIEW';

export interface ProjectFilterCriteria {
  search?: string;
  searchQuery?: string;
  projectStatus?: ProjectOperationalStatus | 'ALL';
  status?: ProjectStatus | string;
  monitoringPriority?: MonitoringPriority | 'ALL';
  priority?: MonitoringPriority | 'ALL' | string;
  schemeId?: string;
  divisionId?: string;
  stateId?: string;
  state?: string;
  districtId?: string;
  district?: string;
  organizationId?: string;
}

export interface ProjectFundingIntelligence {
  sanctionedAmount: number;
  releasedAmount: number;
  utilizedAmount: number;
  unspentAmount: number;
  utilizationPercentage: number;
  releaseRatio: number;
  utilizationRatio: number;
  status?: string;
  financialYear?: string;
}

export interface ProjectBeneficiaryIntelligence {
  target: number;
  registered: number;
  verified: number;
  attendance: number;
  coveragePercentage: number;
  verificationPercentage: number;
  attendanceRate: number;
  discrepancyFlags: string[];
}

// ==========================================
// 7. FUNDING & BENEFICIARY SUMMARY
// ==========================================

export type FundingStatus =
  | 'SANCTIONED'
  | 'PARTIALLY_RELEASED'
  | 'RELEASED'
  | 'UTILIZATION_PENDING'
  | 'CLOSED';

export interface Funding {
  fundingId: string;
  projectId: string;
  organizationId: string;
  schemeId?: string;

  sanctionedAmount: number;
  releasedAmount: number;
  utilizedAmount: number;
  unspentAmount: number; // releasedAmount - utilizedAmount

  utilizationPercentage: number; // utilizedAmount / releasedAmount * 100

  releaseDate?: string;
  financialYear: string;

  tranches?: Array<{
    trancheNumber: number;
    amount: number;
    status: 'PENDING' | 'DISBURSED' | 'WITHHELD';
    disbursementDate?: string;
  }>;

  status: FundingStatus;
  anomalyIds: string[];

  dataSource: DataSourceMetadata;
}

export interface BeneficiarySummary {
  beneficiarySummaryId: string;
  projectId: string;
  organizationId: string;

  targetCount: number;
  enrolledCount: number;
  reportedCount: number;
  verifiedCount: number;

  attendanceRate?: number;

  demographicSummary?: {
    ageGroups?: Record<string, number>;
    genderSummary?: Record<string, number>;
  };

  geographicSummary?: {
    stateId?: string;
    districtId?: string;
    localityCount?: number;
  };

  discrepancyFlags: string[];
  anomalyIds: string[];

  dataSource: DataSourceMetadata;
}

// ==========================================
// 8. INSPECTION, FINDINGS & EVIDENCE
// ==========================================

export type MasterInspectionType =
  | 'Routine Inspection'
  | 'Surprise Inspection'
  | 'Special Audit'
  | 'Follow-up'
  | 'SURPRISE_PHYSICAL'
  | 'RANDOM_VC'
  | 'ROUTINE';

export type MasterInspectionStatus =
  | 'Awaiting Assignment'
  | 'Assigned'
  | 'Accepted / Acknowledged'
  | 'In Progress'
  | 'Submitted / Awaiting Review'
  | 'Completed'
  | 'Pending Verification'
  | 'Scheduled'
  | 'OVERDUE'
  | 'ESCALATED';

export interface MasterInspection {
  inspectionId: string;
  projectId: string;
  organizationId: string;
  schemeId?: string;
  divisionId?: string;
  inspectorId: string;
  pmuId?: string;
  teamId?: string;

  inspectionType: MasterInspectionType;
  inspectionStatus: MasterInspectionStatus;
  priority: MasterPriority;

  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;

  locationVerified: boolean;
  geofenceStatus?: 'INSIDE' | 'OUTSIDE' | 'OVERRIDDEN';
  distanceMeters?: number;

  checklistCompletedCount?: number;
  totalChecklistCount?: number;
  findingsCount?: number;
  evidenceCount?: number;

  findingIds: string[];
  evidenceIds: string[];
  anomalyIds: string[];

  overallScore?: number;
  complianceScore?: number;

  submissionStatus: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'ARCHIVED';

  createdAt: string;
  updatedAt: string;

  dataSource: DataSourceMetadata;

  // Backward compatibility with existing InspectionAssignment
  id: string; // mirrors inspectionId
  projectName?: string;
  projectAddress?: string;
  assignedOfficerName?: string;
  type?: string;
  status?: string;
}

export type FindingSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FindingStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface Finding {
  findingId: string;
  inspectionId: string;
  projectId: string;
  organizationId: string;

  category: string;
  title: string;
  description: string;

  severity: FindingSeverity;
  status: FindingStatus;

  evidenceIds: string[];
  anomalyIds: string[];

  recommendedAction?: string;

  createdAt: string;
  updatedAt: string;
}

export interface MasterEvidence {
  evidenceId: string;
  inspectionId: string;
  projectId: string;

  type: 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'VOICE_NOTE';
  category: string;
  title: string;
  fileUrl: string;

  latitude: number;
  longitude: number;
  capturedAt: string;

  hash: string; // Cryptographic SHA-256 integrity hash
  integrityStatus: 'VERIFIED' | 'TAMPERED' | 'UNVERIFIED';

  metadata?: Record<string, any>;
  dataSource: DataSourceMetadata;
}

// ==========================================
// 9. SOCIAL AUDIT & RISK INTELLIGENCE
// ==========================================

export interface SocialAudit {
  socialAuditId: string;
  projectId: string;
  organizationId: string;
  conductedDate: string;

  auditorType: 'COMMUNITY_MEMBERS' | 'GRAM_SABHA' | 'INDEPENDENT_EVALUATOR' | 'JOINT_TEAM';
  participantCount: number;

  satisfactionRating: number; // 1 - 5 scale
  keyObservations: string[];
  discrepanciesIdentified: string[];

  resolutionStatus: 'RESOLVED' | 'UNDER_REVIEW' | 'FLAGGED';
  reportDocumentUrl?: string;

  dataSource: DataSourceMetadata;
}

export type MasterAnomalyType =
  | 'ATTENDANCE_CCTV_MISMATCH'
  | 'BENEFICIARY_VERIFICATION_MISMATCH'
  | 'FINANCIAL_UTILIZATION_CONCERN'
  | 'PROJECT_PROGRESS_MISMATCH'
  | 'INSPECTION_OVERDUE'
  | 'REPEATED_INSPECTION_FINDING'
  | 'DOCUMENTATION_GAP'
  | 'CROSS_SOURCE_INCONSISTENCY'
  | 'UNUSUAL_ATTENDANCE_PATTERN'
  | 'UNUSUAL_UTILIZATION_PATTERN';

export type AnomalySeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AnomalySourceSignal {
  name: string;
  type: string;
  status: 'AVAILABLE' | 'MISSING' | 'CORROBORATING';
  details?: string;
}

export interface AnomalyVariance {
  absolute?: number;
  percentage?: number;
  description?: string;
}

export interface MasterAnomaly {
  anomalyId: string;
  id: string; // mirrors anomalyId
  title: string;
  type: MasterAnomalyType | string;
  severity: AnomalySeverityLevel | MasterRiskLevel;
  confidence: number; // 0 - 100 deterministic
  confidenceLevel: AnomalyConfidenceLevel;
  status: 'OPEN' | 'PENDING_REVIEW' | 'REVIEWED' | 'VERIFIED' | 'FALSE_POSITIVE' | 'ESCALATED' | string;
  description: string;
  detectedAt?: string;
  createdAt: string;
  updatedAt?: string;

  projectId: string;
  organizationId: string;
  schemeId?: string;
  divisionId?: string;

  sourceSignals: AnomalySourceSignal[];
  evidenceIds?: string[];

  observedValues?: Record<string, any>;
  expectedValues?: Record<string, any>;
  variance?: AnomalyVariance;
  threshold?: string;

  explanation: string;
  recommendedActions: string[];
  relatedAnomalyIds?: string[];

  reviewedBy?: string;
  reviewedAt?: string;
  dataSource: DataSourceMetadata;

  // Backward compatibility fields
  category?: string;
  timestamp?: string;
  riskScore?: number;
  scoreBreakdown?: Array<{ factor: string; points: number }>;
  recommendedAction?: string; // singular backward compat
}

export interface AnomalyFilterCriteria {
  searchQuery?: string;
  search?: string;
  severity?: AnomalySeverityLevel | 'ALL' | string;
  type?: MasterAnomalyType | 'ALL' | string;
  status?: string;
  projectId?: string;
  organizationId?: string;
  schemeId?: string;
  divisionId?: string;
}

export interface AnomalySummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  requiresReview: number;
  byType: Record<string, number>;
}

export interface RiskScore {
  riskScoreId: string;
  entityId: string; // projectId or organizationId
  entityType: 'PROJECT' | 'ORGANIZATION';

  overallScore: number; // 0 - 100
  riskLevel: MasterRiskLevel;

  factors: Array<{
    category: string;
    factor: string;
    weight: number;
    score: number;
    description: string;
  }>;

  evaluatedAt: string;
  nextEvaluationDue?: string;

  dataSource: DataSourceMetadata;
}

export interface AIRecommendation {
  recommendationId: string;
  targetEntityId: string;
  targetEntityType: 'PROJECT' | 'ORGANIZATION' | 'SCHEME';

  title: string;
  summary: string;
  actionType:
    | 'TRIGGER_SURPRISE_INSPECTION'
    | 'REQUEST_GEOFENCE_AUDIT'
    | 'SCHEDULE_VIDEO_VERIFICATION'
    | 'WITHHOLD_FUND_RELEASE'
    | 'INITIATE_DOCUMENT_INQUIRY'
    | 'ROUTINE_MONITORING';

  confidenceScore: number; // 0.0 - 1.0
  reasoning: string[];
  priority: MonitoringPriority;

  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED' | 'EXECUTED';
  generatedAt: string;

  dataSource: DataSourceMetadata;
}

// ==========================================
// 10. SYSTEM LOGS & NOTIFICATIONS
// ==========================================

export interface MasterNotification {
  notificationId: string;
  userId?: string;
  role?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  referenceEntityType?: string;
  referenceEntityId?: string;
  createdAt: string;
}

export interface MasterAuditLog {
  auditLogId: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// ==========================================
// 11. SEARCH & FILTER CRITERIA
// ==========================================

export interface FilterCriteria {
  search?: string;
  divisionId?: string;
  schemeId?: string;
  stateId?: string;
  districtId?: string;
  organizationType?: OrganizationType;
  projectStatus?: ProjectOperationalStatus;
  priority?: MasterPriority;
  riskLevel?: MasterRiskLevel;
  monitoringPriority?: MonitoringPriority;
  financialYear?: string;
}

// Master Type Aliases for flexibility and backward compatibility
export type MasterDivision = Division;
export type MasterScheme = Scheme;
export type MasterState = State;
export type MasterDistrict = District;
export type MasterFunding = Funding;
export type MasterBeneficiarySummary = BeneficiarySummary;


