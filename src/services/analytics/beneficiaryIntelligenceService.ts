/**
 * NIRIKSHAN Beneficiary Intelligence Service
 * SIH26095 | MoSJE
 *
 * Provides aggregate-only statistical analysis of beneficiary enrollment, attendance,
 * and physical/optical verification consistency.
 *
 * STRICT PRIVACY & SAFETY RULES:
 * - Aggregate statistical analysis ONLY.
 * - Absolutely NO individual Personally Identifiable Information (PII).
 * - No beneficiary names, Aadhaar numbers, phone numbers, or residential addresses.
 * - Baseline preservation: PRJ-101 (Target 50, Registered 50, Reported 42, Optical Verified 25).
 */

import { ProjectBeneficiaryIntelligence } from '../../types/master';
import { masterLookup } from '../../data/master';

export class BeneficiaryIntelligenceService {
  /**
   * Retrieve aggregate beneficiary profile for a project
   */
  public async getProjectBeneficiarySummary(
    projectId: string
  ): Promise<ProjectBeneficiaryIntelligence | undefined> {
    const ben = masterLookup.getBeneficiariesByProject(projectId);
    const proj = masterLookup.getProjectById(projectId);

    if (!ben && !proj) return undefined;

    const target = ben?.targetCount ?? proj?.beneficiaryTarget ?? 50;
    const registered = ben?.enrolledCount ?? proj?.attendance?.capacity ?? target;
    const attendance = ben?.reportedCount ?? proj?.attendance?.present ?? proj?.beneficiaryReported ?? 0;
    const verified = ben?.verifiedCount ?? proj?.beneficiaryVerified ?? attendance;

    const coveragePercentage = target > 0 ? Math.round((registered / target) * 10000) / 100 : 100;
    const attendanceRate = registered > 0 ? Math.round((attendance / registered) * 10000) / 100 : 0;
    const verificationPercentage = attendance > 0 ? Math.round((verified / attendance) * 10000) / 100 : 100;

    const discrepancyFlags: string[] = [];
    if (ben?.discrepancyFlags) {
      discrepancyFlags.push(...ben.discrepancyFlags);
    }
    if (attendance > 0 && verified < attendance * 0.8) {
      if (!discrepancyFlags.includes('ATTENDANCE_CCTV_MISMATCH')) {
        discrepancyFlags.push('ATTENDANCE_CCTV_MISMATCH');
      }
    }

    return {
      target,
      registered,
      verified,
      attendance,
      coveragePercentage,
      verificationPercentage,
      attendanceRate,
      discrepancyFlags,
    };
  }

  /**
   * Retrieve enrollment coverage vs target
   */
  public async getBeneficiaryCoverage(
    projectId: string
  ): Promise<{ target: number; registered: number; coveragePercentage: number } | undefined> {
    const summary = await this.getProjectBeneficiarySummary(projectId);
    if (!summary) return undefined;

    return {
      target: summary.target,
      registered: summary.registered,
      coveragePercentage: summary.coveragePercentage,
    };
  }

  /**
   * Retrieve daily attendance roll-call summary
   */
  public async getAttendanceSummary(
    projectId: string
  ): Promise<{ registered: number; present: number; attendanceRate: number } | undefined> {
    const summary = await this.getProjectBeneficiarySummary(projectId);
    if (!summary) return undefined;

    return {
      registered: summary.registered,
      present: summary.attendance,
      attendanceRate: summary.attendanceRate,
    };
  }

  /**
   * Retrieve optical verification vs reported roll-call
   */
  public async getVerificationSummary(
    projectId: string
  ): Promise<{ reported: number; verified: number; verificationPercentage: number; discrepancyDetected: boolean } | undefined> {
    const summary = await this.getProjectBeneficiarySummary(projectId);
    if (!summary) return undefined;

    return {
      reported: summary.attendance,
      verified: summary.verified,
      verificationPercentage: summary.verificationPercentage,
      discrepancyDetected: summary.discrepancyFlags.length > 0,
    };
  }
}

export const beneficiaryIntelligenceService = new BeneficiaryIntelligenceService();
