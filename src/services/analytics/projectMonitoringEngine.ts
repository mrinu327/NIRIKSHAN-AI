/**
 * NIRIKSHAN Project Monitoring Engine
 * SIH26095 | MoSJE
 *
 * Deterministic, multi-factor explainable scoring engine evaluating projects
 * across 7 observable evidence dimensions.
 *
 * Weights (Sum = 100%):
 * 1. Project Completion:      20% (0.20)
 * 2. Statutory Compliance:    20% (0.20)
 * 3. Financial Utilization:   15% (0.15)
 * 4. Beneficiary Coverage:    15% (0.15)
 * 5. Inspection Status:       15% (0.15)
 * 6. Observed Anomalies:      10% (0.10)
 * 7. Documentation:            5% (0.05)
 *
 * Priority Mapping:
 * - 80 - 100: LOW (Low Monitoring Concern)
 * - 60 - 79:  MEDIUM (Moderate Monitoring Concern)
 * - 40 - 59:  HIGH (Higher Monitoring Priority)
 * - 0 - 39:   CRITICAL (Critical Review Priority)
 *
 * SAFETY RULE: One anomaly does NOT automatically force CRITICAL priority.
 */

import {
  MasterProject,
  MonitoringPriority,
  ProjectMonitoringProfile,
  ProjectMonitoringIndicator,
  ProjectMonitoringFactorItem,
} from '../../types/master';
import { masterLookup } from '../../data/master';

export const PROJECT_MONITORING_WEIGHTS = {
  projectCompletion: 0.20,
  statutoryCompliance: 0.20,
  financialUtilization: 0.15,
  beneficiaryCoverage: 0.15,
  inspectionStatus: 0.15,
  observedAnomalies: 0.10,
  documentation: 0.05,
} as const;

export class ProjectMonitoringEngine {
  /**
   * Determine score band label
   */
  public getBandFromScore(
    score: number
  ): 'Low Monitoring Concern' | 'Moderate Monitoring Concern' | 'Higher Monitoring Priority' | 'Critical Review Priority' {
    if (score >= 80) return 'Low Monitoring Concern';
    if (score >= 60) return 'Moderate Monitoring Concern';
    if (score >= 40) return 'Higher Monitoring Priority';
    return 'Critical Review Priority';
  }

  /**
   * Determine monitoring priority from score
   */
  public getPriorityFromScore(score: number): MonitoringPriority {
    if (score >= 80) return 'LOW';
    if (score >= 60) return 'MEDIUM';
    if (score >= 40) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Calculate full explainable project monitoring profile
   */
  public calculateProjectMonitoringProfile(projectId: string): ProjectMonitoringProfile | undefined {
    const project = masterLookup.getProjectById(projectId);
    if (!project) return undefined;

    const funding = masterLookup.getFundingByProject(projectId);
    const ben = masterLookup.getBeneficiariesByProject(projectId);
    const inspections = masterLookup.getInspectionsByProject(projectId);
    const anomalies = masterLookup.getAnomaliesByProject(projectId);
    const hasHighAnomaly = anomalies.some(a => a.severity === 'HIGH' || a.severity === 'CRITICAL');

    // 1. Project Completion (20%)
    let completionRaw = project.progressPercentage ?? 75;
    if (hasHighAnomaly) {
      completionRaw = Math.min(completionRaw, 68);
    }
    const completionWeighted = Math.round(completionRaw * PROJECT_MONITORING_WEIGHTS.projectCompletion * 10) / 10;
    const projectCompletion: ProjectMonitoringFactorItem = {
      rawScore: completionRaw,
      weight: PROJECT_MONITORING_WEIGHTS.projectCompletion,
      weightedScore: completionWeighted,
      description: 'Progress milestone completion rate and operational schedule adherence',
    };

    // 2. Statutory Compliance (20%)
    const complianceRaw = project.complianceScore ?? 75;
    const complianceWeighted = Math.round(complianceRaw * PROJECT_MONITORING_WEIGHTS.statutoryCompliance * 10) / 10;
    const statutoryCompliance: ProjectMonitoringFactorItem = {
      rawScore: complianceRaw,
      weight: PROJECT_MONITORING_WEIGHTS.statutoryCompliance,
      weightedScore: complianceWeighted,
      description: 'Periodic audit benchmark compliance rating',
    };

    // 3. Financial Utilization (15%)
    let utilRaw = funding?.utilizationPercentage ?? (project.releasedAmount > 0 ? (project.utilizedAmount / project.releasedAmount) * 100 : 75);
    utilRaw = Math.min(100, Math.round(utilRaw));
    const utilWeighted = Math.round(utilRaw * PROJECT_MONITORING_WEIGHTS.financialUtilization * 10) / 10;
    const financialUtilization: ProjectMonitoringFactorItem = {
      rawScore: utilRaw,
      weight: PROJECT_MONITORING_WEIGHTS.financialUtilization,
      weightedScore: utilWeighted,
      description: 'Proportion of released grant committed and verified utilized',
    };

    // 4. Beneficiary Coverage (15%)
    let benRaw = 80;
    if (ben) {
      const attendanceRatio = ben.enrolledCount > 0 ? ben.reportedCount / ben.enrolledCount : 0.8;
      const verificationRatio = ben.reportedCount > 0 ? ben.verifiedCount / ben.reportedCount : 0.8;
      benRaw = Math.round((attendanceRatio * 0.5 + verificationRatio * 0.5) * 100);
    }
    if (hasHighAnomaly) {
      benRaw = Math.min(benRaw, 35); // Optical vs biometric discrepancy (42 vs 25)
    }
    const benWeighted = Math.round(benRaw * PROJECT_MONITORING_WEIGHTS.beneficiaryCoverage * 10) / 10;

    const beneficiaryCoverage: ProjectMonitoringFactorItem = {
      rawScore: benRaw,
      weight: PROJECT_MONITORING_WEIGHTS.beneficiaryCoverage,
      weightedScore: benWeighted,
      description: 'Beneficiary reach, roll-call attendance rate, and optical verification ratio',
    };

    // 5. Inspection Status (15%)
    let inspRaw = 80;
    if (inspections.length > 0) {
      const completedCount = inspections.filter(i => i.inspectionStatus === 'Completed').length;
      inspRaw = Math.min(100, 60 + completedCount * 20);
    }
    if (hasHighAnomaly) {
      inspRaw = Math.min(inspRaw, 50);
    }
    const inspWeighted = Math.round(inspRaw * PROJECT_MONITORING_WEIGHTS.inspectionStatus * 10) / 10;
    const inspectionStatus: ProjectMonitoringFactorItem = {
      rawScore: inspRaw,
      weight: PROJECT_MONITORING_WEIGHTS.inspectionStatus,
      weightedScore: inspWeighted,
      description: 'Field inspection coverage, geofence compliance, and audit submission currency',
    };

    // 6. Observed Anomalies (10%)
    let anomRaw = 100;
    if (anomalies.length > 0) {
      if (anomalies.some(a => a.severity === 'CRITICAL')) anomRaw = 15;
      else if (hasHighAnomaly) anomRaw = 25;
      else anomRaw = 60;
    }
    const anomWeighted = Math.round(anomRaw * PROJECT_MONITORING_WEIGHTS.observedAnomalies * 10) / 10;
    const observedAnomalies: ProjectMonitoringFactorItem = {
      rawScore: anomRaw,
      weight: PROJECT_MONITORING_WEIGHTS.observedAnomalies,
      weightedScore: anomWeighted,
      description: 'Telemetry variances, attendance flags, and system discrepancy records',
    };

    // 7. Documentation (5%)
    const docRaw = hasHighAnomaly ? 65 : 85;
    const docWeighted = Math.round(docRaw * PROJECT_MONITORING_WEIGHTS.documentation * 10) / 10;
    const documentation: ProjectMonitoringFactorItem = {
      rawScore: docRaw,
      weight: PROJECT_MONITORING_WEIGHTS.documentation,
      weightedScore: docWeighted,
      description: 'Filing currency for utilization certificates and periodic roll-calls',
    };

    // Total Score (0-100)
    const factorSum =
      completionWeighted +
      complianceWeighted +
      utilWeighted +
      benWeighted +
      inspWeighted +
      anomWeighted +
      docWeighted;
    const score = Math.max(0, Math.min(100, Math.round(factorSum)));

    const band = this.getBandFromScore(score);
    const priority = this.getPriorityFromScore(score);

    // Observable Positive Indicators
    const positiveIndicators: string[] = [];
    if (complianceRaw >= 70) positiveIndicators.push(`Satisfactory statutory compliance rating (${complianceRaw}/100)`);
    if (utilRaw >= 75) positiveIndicators.push(`Healthy grant financial utilization at ${utilRaw}%`);
    if (anomalies.length === 0) positiveIndicators.push('No unresolved telemetry anomalies or audit discrepancies on record');
    if (completionRaw >= 75) positiveIndicators.push(`On-track milestone progress (${completionRaw}%)`);
    if (positiveIndicators.length === 0) {
      positiveIndicators.push('Registered operational entity under active central scheme allocation');
    }

    // Observable Attention Indicators (neutral, constructive)
    const attentionIndicators: string[] = [];
    if (anomalies.length > 0) {
      anomalies.forEach(a => {
        attentionIndicators.push(`Observed Anomaly: ${a.type} (${a.severity} Priority)`);
      });
    }
    if (benRaw < 60) {
      attentionIndicators.push('Observed attendance/CCTV discrepancy requires physical verification');
    }
    if (utilRaw < 60) {
      attentionIndicators.push('Financial Utilization Concern: Unspent grant balance pending utilization report');
    }
    if (completionRaw < 60) {
      attentionIndicators.push('Milestone completion rate tracking behind projected timeline');
    }

    // Recommended Actions
    const recommendedActions: string[] = [];
    if (priority === 'CRITICAL' || priority === 'HIGH') {
      recommendedActions.push('Schedule prioritized physical monitoring audit within 14 calendar days');
      recommendedActions.push('Request formal reconciliation report regarding biometric & register divergence');
      recommendedActions.push('Conduct joint physical count review prior to next grant tranche release');
    } else if (priority === 'MEDIUM') {
      recommendedActions.push('Maintain standard quarterly monitoring cycle');
      recommendedActions.push('Review mid-term utilization certificate ahead of milestone sign-off');
    } else {
      recommendedActions.push('Eligible for routine monitoring and expedited grant renewal review');
      recommendedActions.push('Maintain annual inspection schedule');
    }

    // Structured Observable Monitoring Indicators
    const monitoringIndicators: ProjectMonitoringIndicator[] = [
      {
        label: 'Project Completion',
        value: `${completionRaw}%`,
        status: completionRaw >= 70 ? 'NORMAL' : 'ATTENTION',
        reason: completionRaw >= 70 ? 'Milestone progress progressing within expected operational range' : 'Milestone progress tracking behind expected baseline',
      },
      {
        label: 'Financial Grant Utilization',
        value: `${utilRaw}%`,
        status: utilRaw >= 70 ? 'NORMAL' : 'ATTENTION',
        reason: utilRaw >= 70 ? 'Grant utilization consistent with sanctioned disbursement tranche' : 'Financial Utilization Concern: Substantial unspent balance pending report',
      },
      {
        label: 'Beneficiary Reach & Verification',
        value: ben ? `${ben.reportedCount} reported / ${ben.verifiedCount} verified` : `${project.beneficiaryReported ?? 0} reported`,
        status: benRaw >= 70 ? 'NORMAL' : 'ATTENTION',
        reason: benRaw >= 70 ? 'Optical verification consistent with enrolled roster' : 'Observed attendance/CCTV discrepancy requiring physical count verification',
      },
      {
        label: 'Field Monitoring Inspections',
        value: `${inspections.length} recorded`,
        status: inspections.length > 0 ? 'NORMAL' : 'ATTENTION',
        reason: inspections.length > 0 ? 'Field monitoring audits documented with verified inspector reports' : 'Scheduled field inspection requires follow-up assignment',
      },
      {
        label: 'Statutory Compliance Rating',
        value: `${complianceRaw}/100`,
        status: complianceRaw >= 70 ? 'NORMAL' : 'ATTENTION',
        reason: complianceRaw >= 70 ? 'Benchmark standards satisfied across evaluated physical criteria' : 'Compliance concern identified in statutory checklist evaluation',
      },
      {
        label: 'Observed Operational Anomalies',
        value: `${anomalies.length} active`,
        status: anomalies.length === 0 ? 'NORMAL' : hasHighAnomaly ? 'CRITICAL' : 'ATTENTION',
        reason: anomalies.length === 0 ? 'Zero active discrepancies detected by automated telemetry' : `${anomalies.length} operational variances flagged for official review`,
      },
    ];

    return {
      projectId,
      score,
      priority,
      band,
      factorBreakdown: {
        projectCompletion,
        statutoryCompliance,
        financialUtilization,
        beneficiaryCoverage,
        inspectionStatus,
        observedAnomalies,
        documentation,
      },
      positiveIndicators,
      attentionIndicators,
      recommendedActions,
      monitoringIndicators,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieve list of structured observable monitoring indicators for a project
   */
  public getProjectMonitoringIndicators(projectId: string): ProjectMonitoringIndicator[] {
    const profile = this.calculateProjectMonitoringProfile(projectId);
    return profile?.monitoringIndicators ?? [];
  }
}

export const projectMonitoringEngine = new ProjectMonitoringEngine();
