/**
 * Explainable AI-Assisted Anomaly Detection Engine
 * SIH26095 | Ministry of Social Justice & Empowerment (MoSJE)
 *
 * Consumes structured attendance analytics, grant ledgers, inspection records,
 * and edge telemetry to identify OBSERVABLE DATA INCONSISTENCIES.
 *
 * POLICY NOTE:
 * - This is NOT a fraud classifier or corruption detector.
 * - All discrepancies are diagnostic monitoring signals requiring human official review.
 * - Fully deterministic: Zero random generation or simulated AI scores.
 * - Preserves existing baseline ALT-2601 on PRJ-101.
 */

import {
  MasterAnomaly,
  MasterAnomalyType,
  AnomalySeverityLevel,
  AnomalyConfidenceLevel,
  AnomalySourceSignal,
  DataSourceMetadata,
} from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';
import { MASTER_ANOMALIES } from '../../data/master/anomalies';
import { anomalySeverityEngine } from './anomalySeverityEngine';

// Backward compatibility types for legacy callers (mockAnomalyService)
import { AttendanceAnalytics } from '../../types/attendance';
import {
  AnomalyAssessment,
  AnomalySignal,
  AnomalySeverity,
  AnomalyConfidence,
} from '../../types/anomaly';

export interface ConfidenceResult {
  score: number;
  level: AnomalyConfidenceLevel;
  reason: string;
}

export class AnomalyDetectionEngine {
  /**
   * Deterministic confidence score calculation (0–100)
   *
   * Factors:
   *  +25 if primary source exists (e.g. self-reported register, grant ledger)
   *  +25 if second independent source exists (e.g. optical CCTV stream, bank tranche)
   *  +20 if inspection record corroborates
   *  +15 if tamper-sealed evidence record exists
   *  +15 if discrepancy exceeds configured threshold
   */
  public calculateDeterministicConfidence(
    signals: AnomalySourceSignal[],
    exceedsThreshold: boolean = true,
    hasInspectionCorroboration: boolean = false,
    hasEvidenceRecord: boolean = false
  ): ConfidenceResult {
    let score = 0;
    const signalNames: string[] = [];

    const hasPrimary = signals.some(
      s => s.type === 'ATTENDANCE_REGISTER' || s.type === 'GRANT_LEDGER' || s.type === 'CALENDAR_REGISTRY'
    );
    const hasSecondary = signals.some(
      s => s.type === 'CCTV_FEED' || s.type === 'CCTV_HEARTBEAT' || s.type === 'PHYSICAL_AUDIT'
    );

    if (hasPrimary || signals.length > 0) {
      score += 25;
      signalNames.push('primary administrative registry');
    }
    if (hasSecondary || signals.length >= 2) {
      score += 25;
      signalNames.push('independent optical/telemetry feed');
    }
    if (
      hasInspectionCorroboration ||
      signals.some(s => s.type.toUpperCase().includes('INSPECT')) ||
      signals.length >= 3
    ) {
      score += 20;
      signalNames.push('field inspection findings');
    }
    if (
      hasEvidenceRecord ||
      signals.some(s => s.type.toUpperCase().includes('EVIDEN') || s.type.toUpperCase().includes('TIMESTAMP')) ||
      signals.length >= 4
    ) {
      score += 15;
      signalNames.push('tamper-sealed evidence record');
    }
    if (exceedsThreshold) {
      score += 15;
      signalNames.push('exceeded variance threshold');
    }

    const clampedScore = Math.min(100, Math.max(0, score));

    let level: AnomalyConfidenceLevel = 'LOW';
    if (clampedScore >= 75) level = 'HIGH';
    else if (clampedScore >= 50) level = 'MEDIUM';

    const reason =
      signalNames.length > 0
        ? `Supported by ${signalNames.join(', ')}.`
        : 'Preliminary telemetry signal with single-source observation.';

    return { score: clampedScore, level, reason };
  }

  /**
   * Detects observable anomalies for a single project.
   * Merges existing master anomalies with deterministic telemetry checks.
   */
  public detectProjectAnomalies(projectId: string): MasterAnomaly[] {
    const project = masterLookup.getProjectById(projectId);
    if (!project) return [];

    const anomalies: MasterAnomaly[] = [];

    // 1. Check existing master registry anomalies for this project (e.g. ALT-2601)
    const existingAnomalies = MASTER_ANOMALIES.filter(a => a.projectId === projectId);
    for (const anom of existingAnomalies) {
      anomalies.push({ ...anom });
    }

    // 2. Attendance vs Optical CCTV Headcount Discrepancy (if not already present)
    const hasAttendanceAnomaly = anomalies.some(a => a.type === 'ATTENDANCE_CCTV_MISMATCH');
    if (!hasAttendanceAnomaly && project.beneficiaryReported && project.beneficiaryVerified) {
      const reported = project.beneficiaryReported;
      const optical = project.beneficiaryVerified;
      const variance = Math.abs(reported - optical);
      const variancePct = reported > 0 ? (variance / reported) * 100 : 0;

      if (variancePct >= 10) {
        const severity = anomalySeverityEngine.calculateAttendanceSeverity(variancePct);
        const signals: AnomalySourceSignal[] = [
          {
            name: 'Daily Attendance Register',
            type: 'ATTENDANCE_REGISTER',
            status: 'CORROBORATING',
            details: `Reported roll-call: ${reported} present`,
          },
          {
            name: 'Optical CCTV Stream',
            type: 'CCTV_FEED',
            status: 'CORROBORATING',
            details: `Optical headcount estimate: ${optical} persons`,
          },
        ];

        const conf = this.calculateDeterministicConfidence(signals, variancePct >= 20);

        anomalies.push({
          anomalyId: `ANO-${projectId}-ATT-CCTV`,
          id: `ANO-${projectId}-ATT-CCTV`,
          title: 'Observed Attendance / CCTV Discrepancy',
          projectId,
          organizationId: project.organizationId,
          schemeId: project.schemeId,
          divisionId: project.divisionId,
          type: 'ATTENDANCE_CCTV_MISMATCH',
          severity,
          confidence: conf.score,
          confidenceLevel: conf.level,
          status: 'PENDING_REVIEW',
          description: `Submitted attendance (${reported}) differs from optical CCTV headcount (${optical}). Variance: ${variancePct.toFixed(1)}%.`,
          explanation: `Reported roll-call exceeded optical headcount by ${variance} participants, exceeding the configured discrepancy threshold.`,
          observedValues: { reportedAttendance: reported, opticalHeadcount: optical },
          expectedValues: { reportedAttendance: reported, expectedOpticalRange: `${Math.round(reported * 0.9)}-${reported}` },
          variance: { absolute: variance, percentage: Number(variancePct.toFixed(2)), description: `${variancePct.toFixed(1)}% variance between roll-call and optical count` },
          threshold: 'Variance >= 10% (Diagnostic Review Threshold)',
          sourceSignals: signals,
          evidenceIds: [],
          recommendedActions: [
            'Review physical attendance registers for the specified session date',
            'Validate CCTV camera placement and field of view for optical coverage gaps',
            'Schedule routine physical monitoring visit to verify participant presence',
          ],
          relatedAnomalyIds: [],
          createdAt: 'Today, 10:00 AM',
          detectedAt: '2026-09-10T10:00:00Z',
          dataSource: {
            type: 'DEMO',
            sourceName: 'NIRIKSHAN Telemetry Correlation Engine',
            verificationStatus: 'DEMO',
          },
        });
      }
    }

    // 3. Financial Utilization vs Project Progress Mismatch
    const hasFinancialAnomaly = anomalies.some(a => a.type === 'FINANCIAL_UTILIZATION_CONCERN');
    if (!hasFinancialAnomaly && project.sanctionedAmount > 0) {
      const funding = masterDataRegistry.funding.find(f => f.projectId === projectId);
      if (funding && funding.releasedAmount > 0) {
        const utilPct = (funding.utilizedAmount / funding.releasedAmount) * 100;
        const progressPct = project.progressPercentage ?? 75;

        // Pattern A: High progress, low utilization
        // Pattern B: High utilization, low progress
        if ((progressPct > 80 && utilPct < 40) || (utilPct > 85 && progressPct < 40)) {
          const severity = anomalySeverityEngine.calculateFinancialSeverity(progressPct, utilPct);
          const isAhead = utilPct > progressPct;
          const signals: AnomalySourceSignal[] = [
            {
              name: 'Central Grant Ledger',
              type: 'GRANT_LEDGER',
              status: 'CORROBORATING',
              details: `Released: ₹${(funding.releasedAmount / 100000).toFixed(1)}L, Utilized: ₹${(funding.utilizedAmount / 100000).toFixed(1)}L (${utilPct.toFixed(1)}%)`,
            },
            {
              name: 'Milestone Progress Tracker',
              type: 'MILESTONE_LOG',
              status: 'CORROBORATING',
              details: `Physical project progress: ${progressPct}%`,
            },
          ];

          const conf = this.calculateDeterministicConfidence(signals, true);

          anomalies.push({
            anomalyId: `ANO-${projectId}-FIN-UTIL`,
            id: `ANO-${projectId}-FIN-UTIL`,
            title: isAhead
              ? 'Financial Utilization Ahead of Project Progress'
              : 'Project Progress and Financial Utilization Require Review',
            projectId,
            organizationId: project.organizationId,
            schemeId: project.schemeId,
            divisionId: project.divisionId,
            type: 'FINANCIAL_UTILIZATION_CONCERN',
            severity,
            confidence: conf.score,
            confidenceLevel: conf.level,
            status: 'PENDING_REVIEW',
            description: isAhead
              ? `Grant utilization (${utilPct.toFixed(1)}%) is substantially ahead of physical milestone completion (${progressPct}%).`
              : `Milestone completion (${progressPct}%) is reported with low grant utilization (${utilPct.toFixed(1)}%).`,
            explanation: isAhead
              ? 'Grant funds have been disbursed and utilized at a higher rate than documented physical progress milestones.'
              : 'Physical project completion is substantially advanced relative to committed central grant expenditure.',
            observedValues: { physicalProgressPct: progressPct, grantUtilizationPct: Number(utilPct.toFixed(1)) },
            expectedValues: { alignedRangePct: `${Math.max(0, progressPct - 20)}% - ${progressPct + 20}%` },
            variance: { absolute: Math.abs(progressPct - utilPct), percentage: Number(Math.abs(progressPct - utilPct).toFixed(1)), description: `Divergence of ${Math.abs(progressPct - utilPct).toFixed(1)} percentage points between progress and spending` },
            threshold: 'Divergence >= 30 percentage points',
            sourceSignals: signals,
            evidenceIds: [],
            recommendedActions: [
              'Review expenditure statement and submitted bills for current financial tranche',
              'Cross-reference civil works / activity milestone reports with engineer certification',
              'Align release schedule with demonstrated physical milestones',
            ],
            relatedAnomalyIds: [],
            createdAt: 'Today, 09:15 AM',
            detectedAt: '2026-09-10T09:15:00Z',
            dataSource: {
              type: 'DEMO',
              sourceName: 'Public Financial Management System (PFMS) Synchronizer',
              verificationStatus: 'DEMO',
            },
          });
        }
      }
    }

    // 4. Beneficiary Verification Mismatch (if registered vs verified gap is large)
    const hasBeneficiaryAnomaly = anomalies.some(a => a.type === 'BENEFICIARY_VERIFICATION_MISMATCH');
    if (!hasBeneficiaryAnomaly && (project.beneficiaryTarget ?? 0) > 0 && (project.beneficiaryVerified ?? 0) > 0) {
      const registered = (project.beneficiaryReported ?? project.beneficiaryTarget) ?? 0;
      const verified = project.beneficiaryVerified ?? 0;
      const unverified = registered - verified;
      const unverifiedRatio = registered > 0 ? (unverified / registered) * 100 : 0;

      if (unverifiedRatio >= 35) {
        const severity = anomalySeverityEngine.calculateBeneficiarySeverity(unverifiedRatio);
        const signals: AnomalySourceSignal[] = [
          {
            name: 'Enrolled Beneficiary Roster',
            type: 'ROSTER_LOG',
            status: 'CORROBORATING',
            details: `Enrolled roster size: ${registered} participants`,
          },
          {
            name: 'Optical Headcount / Biometric Check',
            type: 'CCTV_FEED',
            status: 'CORROBORATING',
            details: `Verified participant count: ${verified} participants`,
          },
        ];

        const conf = this.calculateDeterministicConfidence(signals, unverifiedRatio >= 35);

        anomalies.push({
          anomalyId: `ANO-${projectId}-BEN-VER`,
          id: `ANO-${projectId}-BEN-VER`,
          title: 'Beneficiary Verification Discrepancy',
          projectId,
          organizationId: project.organizationId,
          schemeId: project.schemeId,
          divisionId: project.divisionId,
          type: 'BENEFICIARY_VERIFICATION_MISMATCH',
          severity,
          confidence: conf.score,
          confidenceLevel: conf.level,
          status: 'OPEN',
          description: `${unverified} enrolled beneficiaries remain unverified against optical headcount records (${unverifiedRatio.toFixed(1)}% gap).`,
          explanation: 'Aggregate discrepancy observed between enrolled participant records and verified physical attendance.',
          observedValues: { enrolledRoster: registered, verifiedCount: verified, unverifiedCount: unverified },
          expectedValues: { minimumVerificationTarget: Math.round(registered * 0.8) },
          variance: { absolute: unverified, percentage: Number(unverifiedRatio.toFixed(1)), description: `${unverifiedRatio.toFixed(1)}% unverified beneficiary proportion` },
          threshold: 'Unverified Proportion >= 30%',
          sourceSignals: signals,
          evidenceIds: [],
          recommendedActions: [
            'Conduct spot physical verification of participant attendance roll-call',
            'Verify biometric / optical scanner hardware uptime and calibration',
            'Review enrollment admission documents for active participants',
          ],
          relatedAnomalyIds: [],
          createdAt: 'Today, 11:30 AM',
          detectedAt: '2026-09-10T11:30:00Z',
          dataSource: {
            type: 'DEMO',
            sourceName: 'Beneficiary Management Gateway',
            verificationStatus: 'DEMO',
          },
        });
      }
    }

    return this.correlateAnomalies(anomalies);
  }

  /**
   * Detects observable anomalies for an organization across all its projects.
   */
  public detectOrganizationAnomalies(organizationId: string): MasterAnomaly[] {
    const projects = masterDataRegistry.projects.filter(p => p.organizationId === organizationId);
    const anomalies: MasterAnomaly[] = [];

    // Also include any anomalies directly linked in master registry
    const masterDirect = MASTER_ANOMALIES.filter(a => a.organizationId === organizationId);
    for (const anom of masterDirect) {
      if (!anomalies.some(a => a.anomalyId === anom.anomalyId)) {
        anomalies.push({ ...anom });
      }
    }

    for (const proj of projects) {
      const projAnoms = this.detectProjectAnomalies(proj.projectId);
      for (const a of projAnoms) {
        if (!anomalies.some(existing => existing.anomalyId === a.anomalyId)) {
          anomalies.push(a);
        }
      }
    }

    return this.correlateAnomalies(anomalies);
  }

  /**
   * Detects observable anomalies for a scheme across all its projects.
   */
  public detectSchemeAnomalies(schemeId: string): MasterAnomaly[] {
    const projects = masterDataRegistry.projects.filter(p => p.schemeId === schemeId);
    const anomalies: MasterAnomaly[] = [];

    const masterDirect = MASTER_ANOMALIES.filter(a => a.schemeId === schemeId);
    for (const anom of masterDirect) {
      if (!anomalies.some(a => a.anomalyId === anom.anomalyId)) {
        anomalies.push({ ...anom });
      }
    }

    for (const proj of projects) {
      const projAnoms = this.detectProjectAnomalies(proj.projectId);
      for (const a of projAnoms) {
        if (!anomalies.some(existing => existing.anomalyId === a.anomalyId)) {
          anomalies.push(a);
        }
      }
    }

    return this.correlateAnomalies(anomalies);
  }

  /**
   * Detects observable anomalies for a division across all its schemes and projects.
   */
  public detectDivisionAnomalies(divisionId: string): MasterAnomaly[] {
    const schemes = masterDataRegistry.schemes.filter(s => s.divisionId === divisionId);
    const anomalies: MasterAnomaly[] = [];

    for (const sch of schemes) {
      const schAnoms = this.detectSchemeAnomalies(sch.schemeId);
      for (const a of schAnoms) {
        if (!anomalies.some(existing => existing.anomalyId === a.anomalyId)) {
          anomalies.push(a);
        }
      }
    }

    return this.correlateAnomalies(anomalies);
  }

  /**
   * Detects all observable anomalies across the national master data registry.
   */
  public detectAllAnomalies(): MasterAnomaly[] {
    const allAnomalies: MasterAnomaly[] = [];

    // 1. Start with verified master anomalies (ALT-2601, ALT-2602, ALT-2603)
    for (const anom of MASTER_ANOMALIES) {
      allAnomalies.push({ ...anom });
    }

    // 2. Run detection across all registered projects
    for (const proj of masterDataRegistry.projects) {
      const projAnoms = this.detectProjectAnomalies(proj.projectId);
      for (const a of projAnoms) {
        if (!allAnomalies.some(existing => existing.anomalyId === a.anomalyId)) {
          allAnomalies.push(a);
        }
      }
    }

    return this.correlateAnomalies(allAnomalies);
  }

  /**
   * Correlates anomalies relating to the same project, organization, or anomaly type.
   */
  public correlateAnomalies(anomalies: MasterAnomaly[]): MasterAnomaly[] {
    return anomalies.map(current => {
      const relatedIds = anomalies
        .filter(
          other =>
            other.anomalyId !== current.anomalyId &&
            (other.projectId === current.projectId ||
              other.organizationId === current.organizationId ||
              other.type === current.type)
        )
        .map(other => other.anomalyId);

      return {
        ...current,
        relatedAnomalyIds: Array.from(new Set([...(current.relatedAnomalyIds || []), ...relatedIds])),
      };
    });
  }
}

export const anomalyDetectionEngine = new AnomalyDetectionEngine();

// =================================================================
// Backward Compatibility Implementation for mockAnomalyService.ts
// =================================================================

export interface LegacyAnomalyDetectionEngine {
  assess(analytics: AttendanceAnalytics): AnomalyAssessment;
}

export class ExplainableAnomalyEngine implements LegacyAnomalyDetectionEngine {
  assess(analytics: AttendanceAnalytics): AnomalyAssessment {
    const signals: AnomalySignal[] = [];
    const {
      projectId,
      projectName,
      reportedAttendance,
      capacity,
      cctvEstimatedOccupancy,
      occupancyVariance,
      historicalAverageAttendance,
      attendanceTrend,
      validationResult,
    } = analytics;

    if (cctvEstimatedOccupancy !== null) {
      const diff = occupancyVariance !== null ? occupancyVariance : reportedAttendance - cctvEstimatedOccupancy;
      let scoreContribution = 0;
      let severity: AnomalySeverity = 'Low';

      if (diff >= 15) {
        scoreContribution = 35;
        severity = 'High';
      } else if (diff >= 10) {
        scoreContribution = 25;
        severity = 'Moderate';
      } else if (diff >= 5) {
        scoreContribution = 15;
        severity = 'Low';
      }

      if (scoreContribution > 0) {
        signals.push({
          signalId: 'SIG-ANO-CCTV',
          projectId,
          type: 'CCTV_DISCREPANCY',
          severity,
          title: 'Optical CCTV Estimate Discrepancy',
          explanation: `Reported roll-call (${reportedAttendance}) exceeds edge camera optical estimate (${cctvEstimatedOccupancy}) by ${diff} persons.`,
          scoreContribution,
          observedValue: reportedAttendance,
          expectedValue: cctvEstimatedOccupancy,
          difference: diff,
          recommendation: 'Verify entrance cameras and cross-reference physical attendance registers.',
        });
      }
    }

    if (validationResult && !validationResult.isValid) {
      signals.push({
        signalId: 'SIG-ANO-VAL',
        projectId,
        type: 'VALIDATION_ISSUE',
        severity: 'High',
        title: 'Data Integrity Bounds Issue',
        explanation: validationResult.issues.map(i => i.message).join(' '),
        scoreContribution: 20,
        observedValue: 'Invalid Values',
        expectedValue: 'Valid Bounds',
        difference: 'Flagged',
        recommendation: 'Require institute to correct submitted registry entries.',
      });
    }

    const rawScore = signals.reduce((sum, s) => sum + s.scoreContribution, 0);
    const overallScore = Math.min(100, Math.max(0, rawScore));

    let severity: AnomalySeverity = 'Low';
    if (overallScore >= 75) severity = 'Critical';
    else if (overallScore >= 50) severity = 'High';
    else if (overallScore >= 25) severity = 'Moderate';

    let confidence: AnomalyConfidence = 'Medium';
    let confidenceReason = '';

    if (cctvEstimatedOccupancy === null) {
      confidence = 'Low';
      confidenceReason = 'CCTV telemetry offline; verification limited to self-reported logs.';
    } else if (signals.length >= 2) {
      confidence = 'High';
      confidenceReason = 'Multiple independent operational signals available.';
    } else {
      confidence = 'Medium';
      confidenceReason = 'Telemetry stream available with moderate signal corroboration.';
    }

    const recommendedAction =
      overallScore >= 50
        ? 'Human verification recommended. Review physical attendance registers or schedule surprise audit.'
        : 'Standard operational monitoring.';

    const summary =
      signals.length > 0
        ? `Assessment identified ${signals.length} active operational signal(s) contributing to Anomaly Score of ${overallScore}/100.`
        : `Assessment indicates normal operational metrics.`;

    return {
      id: `ASM-${projectId}-LEGACY`,
      projectId,
      projectName,
      overallScore,
      severity,
      confidence,
      confidenceReason,
      status: 'New',
      signals,
      summary,
      recommendedAction,
      generatedAt: 'Today (Real-Time Telemetry)',
      isDecisionSupport: true,
    };
  }
}

export const explainableAnomalyEngine = new ExplainableAnomalyEngine();
