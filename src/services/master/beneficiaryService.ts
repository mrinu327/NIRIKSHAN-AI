import { MasterBeneficiarySummary } from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';

export class BeneficiaryService {
  /**
   * Retrieve all beneficiary summary metrics
   */
  public async getAllBeneficiarySummaries(): Promise<MasterBeneficiarySummary[]> {
    return [...masterDataRegistry.beneficiaries];
  }

  /**
   * Retrieve beneficiary profile for a project
   */
  public async getBeneficiarySummary(
    projectId: string
  ): Promise<MasterBeneficiarySummary | undefined> {
    return masterLookup.getBeneficiariesByProject(projectId);
  }

  /**
   * Compute aggregate beneficiary metrics across all projects
   */
  public async getAggregateBeneficiaryMetrics(): Promise<{
    totalEnrolled: number;
    totalActive: number;
    averageAttendanceRate: number;
    totalAadhaarVerified: number;
    verificationPercentage: number;
    projectsWithDiscrepancy: number;
    totalDiscrepantBeneficiaries: number;
  }> {
    const records = masterDataRegistry.beneficiaries;

    let totalTarget = 0;
    let totalEnrolled = 0;
    let totalReported = 0;
    let totalVerified = 0;
    let sumAttendanceRate = 0;
    let projectsWithDiscrepancy = 0;

    records.forEach(b => {
      totalTarget += b.targetCount;
      totalEnrolled += b.enrolledCount;
      totalReported += b.reportedCount;
      totalVerified += b.verifiedCount;
      sumAttendanceRate += b.attendanceRate ?? 0;
      if (b.discrepancyFlags && b.discrepancyFlags.length > 0) {
        projectsWithDiscrepancy++;
      }
    });

    const averageAttendanceRate =
      records.length > 0 ? sumAttendanceRate / records.length : 0;
    const verificationPercentage =
      totalReported > 0 ? (totalVerified / totalReported) * 100 : 0;

    return {
      totalEnrolled,
      totalActive: totalReported,
      averageAttendanceRate: Number(averageAttendanceRate.toFixed(1)),
      totalAadhaarVerified: totalVerified,
      verificationPercentage: Number(verificationPercentage.toFixed(1)),
      projectsWithDiscrepancy,
      totalDiscrepantBeneficiaries: totalReported - totalVerified,
    };
  }
}

export const beneficiaryService = new BeneficiaryService();
